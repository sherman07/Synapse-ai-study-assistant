@app.get("/prompt-modes")
def prompt_modes():
    return {
        "default": DEFAULT_NOTE_PROMPT_MODE,
        "options": note_prompt_mode_options(),
    }


@app.post("/analyze")
async def analyze_materials(
    files: List[UploadFile] = File(default=[]),
    links: str = Form(default="[]"),
    free_text: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    detail_level: str = Form(default="auto"),
    prompt_mode: str = Form(default=DEFAULT_NOTE_PROMPT_MODE),
    client_fingerprint: str = Form(default=""),
):
    del client_fingerprint  # server now uses stable source identity instead
    global stored_summary, stored_sections, stored_connections, stored_mind_map, stored_title, stored_source_identity

    try:
        require_openai()

        content_parts: List[dict] = []
        source_units: List[dict] = []
        title_candidates: List[str] = []
        seen_youtube_sources = set()

        for uploaded in files:
            data = await read_upload_bytes(uploaded, MAX_UPLOAD_BYTES, uploaded.filename or "uploaded file")
            if not data:
                continue
            content_type = uploaded.content_type or mimetypes.guess_type(uploaded.filename or "")[0] or "application/octet-stream"
            parts, meta = file_to_source_unit(uploaded.filename or "uploaded file", content_type, data)
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")
            embedded_parts, embedded_units, embedded_titles = expand_embedded_youtube_sources(
                meta.get("text_excerpt", ""),
                meta,
                seen_youtube_sources,
            )
            if embedded_units:
                content_parts.extend(embedded_parts)
                source_units.extend(embedded_units)
                title_candidates.extend(embedded_titles)

        try:
            parsed_links = json.loads(links) if links else []
        except Exception:
            parsed_links = []

        for url in parsed_links:
            if not isinstance(url, str) or not url.strip():
                continue
            cleaned_url = clean_detected_url(url.strip())
            if get_youtube_video_id(cleaned_url):
                cleaned_url = canonicalize_youtube_watch_url(cleaned_url)
                key = youtube_source_key(cleaned_url)
                if key in seen_youtube_sources:
                    continue
                seen_youtube_sources.add(key)
            parts, meta = link_to_source_unit(cleaned_url)
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")

        for url in extract_youtube_urls_from_text(free_text):
            key = youtube_source_key(url)
            if not key or key in seen_youtube_sources:
                continue
            seen_youtube_sources.add(key)
            parts, meta = link_to_source_unit(url)
            meta["display_name"] = f"YouTube link from pasted text: {meta.get('title_candidate') or url}"
            content_parts.extend(parts)
            source_units.append(meta)
            title_candidates.append(meta.get("title_candidate") or meta.get("display_name") or "")

        cleaned_free_text = remove_urls_from_text(free_text)
        if cleaned_free_text:
            inferred_title = detect_legislation_title(cleaned_free_text[:4000]) or detect_course_or_topic_title(cleaned_free_text[:2500]) or "Pasted text"
            content_hash = sha256_text(cleaned_free_text)
            content_parts.append({
                "type": "text",
                "text": (
                    f"\n\nUSER PROVIDED TEXT\n"
                    f"Detected title/topic: {inferred_title}\n"
                    f"Content:\n{truncate_text(cleaned_free_text)}"
                ),
            })
            source_units.append({
                "display_name": "pasted text",
                "source_identity": f"text:{content_hash}",
                "title_candidate": inferred_title,
                "content_hash": content_hash,
                "text_excerpt": truncate_text(cleaned_free_text, 60000),
            })
            title_candidates.append(inferred_title)

        if not content_parts:
            return {"error": "No readable files, links, or text were provided."}

        combined_source_text = "\n\n".join(
            part.get("text", "") for part in content_parts
            if isinstance(part, dict) and part.get("type") == "text"
        )
        selected_prompt_mode = normalise_note_prompt_mode(prompt_mode)
        selected_prompt_label = note_prompt_mode_label(selected_prompt_mode)
        resolved_language_key = resolve_generation_language_key(preferred_language, combined_source_text)
        postprocess_language = resolved_language_key if normalise_language_key(preferred_language) == "auto" else preferred_language
        depth_plan = choose_learning_depth(combined_source_text, source_units, "auto")
        depth = depth_plan["depth"]
        depth_config = depth_plan["config"]
        if len(source_units) >= 2:
            depth = "comprehensive"
            depth_config = DEPTH_CONFIG["comprehensive"]
            depth_plan["depth"] = depth
            depth_plan["config"] = depth_config
            depth_plan["reason"] = (depth_plan.get("reason", "") + ", professor-level multi-source synthesis").strip(", ")

        source_fingerprint = build_analysis_fingerprint(preferred_language, source_units, depth, selected_prompt_mode)
        cached_result = cache_get(source_fingerprint)
        if cached_result:
            # Rebuild live visual cards from the freshly uploaded files. The cache
            # intentionally does not store large base64 images, but the current
            # request still has the source_units needed to recreate them. Use the
            # deterministic selector here so cache hits do not make fresh model calls.
            if "rebuild_cached_visual_argument_cards" in globals():
                rebuild_cached_visual_argument_cards(source_units, postprocess_language)
            cached_summary = finalize_generated_summary(
                cached_result.get("summary", ""),
                requested_language=preferred_language,
                generation_language=postprocess_language,
                source_context=combined_source_text,
                source_units=source_units,
                attach_visuals=True,
                protect_heading=False,
            )
            cached_result = {**cached_result, "summary": cached_summary, "visual_gallery": build_visual_gallery(source_units)}
            stored_summary = cached_summary
            stored_sections = parse_sections(stored_summary)
            cached_result["sections"] = stored_sections
            stored_connections = cached_result.get("connections", [])
            stored_mind_map = cached_result.get("mind_map", {})
            stored_title = cached_result.get("title", "Generated Study Notes")
            stored_source_identity = cached_result.get("primary_source_identity", "")
            return {
                **cached_result,
                "cached": True,
                "source_fingerprint": source_fingerprint,
                "output_language": postprocess_language,
                "prompt_mode": selected_prompt_mode,
                "prompt_mode_label": selected_prompt_label,
            }

        language_rule = language_instruction_for_generation(preferred_language, combined_source_text)

        source_identity_lines = []
        for index, unit in enumerate(source_units, start=1):
            source_identity_lines.append(
                f"Source {index}: display_name={unit.get('display_name')} | stable_identity={unit.get('source_identity')} | title_candidate={unit.get('title_candidate')}"
            )

        title_hint = choose_best_source_title(title_candidates)
        # v42: use the controlled advanced tutor generator for both single and
        # multi-source uploads. This avoids an expensive source-digest prepass
        # and prevents the old single-source path from producing thin notes that
        # need visual cards patched on afterward.
        source_digest_block = ""
        analysis_task = f"""
{ANALYSIS_PROMPT}

MANDATORY output language for the entire notes: {language_rule}
Do not answer in another language. The full Generated Content must obey this language choice: all headings, explanations, examples, real-world examples, common mistakes, tutor explanations, and critical-thinking questions.

Reference-style target to imitate:
{REFERENCE_STYLE_PROFILE}

For multi-source uploads, use this architecture:
{MULTISOURCE_REFERENCE_STRUCTURE}

Adaptive learning-depth decision:
- Selected depth: {depth_config.get('label', depth)} ({depth}).
- Reasoning data: characters={depth_plan.get('char_count')}, score={depth_plan.get('score')}, sections={depth_plan.get('section_markers')}, formulas={depth_plan.get('formula_markers')}, legal_terms={depth_plan.get('legal_markers')}.
- Depth philosophy: choose the amount of detail that makes the content easiest to understand. Do NOT be brief just to save tokens. If the material is dense, preserve depth. If the material is simple, stay focused and avoid padding.
- Depth instruction: {depth_config.get('instruction')}
- Required section plan for this depth: {', '.join(depth_config.get('sections', []))}.

MANDATORY depth requirement:
- Match the explanation length to the actual complexity of the source, not to an arbitrary fixed word count.
- If the source is a law or formal document, cover definitions, key sections, exceptions, duties, liabilities, procedures, and consequences.
- If the source is a math/video lesson, reconstruct the full teaching sequence, formulas, calculations, verification steps, and common errors.
- If an uploaded PDF, PPT, DOC, or text source contains an embedded YouTube URL, Synapse expands it into a SOURCE YOUTUBE VIDEO transcript source. Treat that video as part of the original source context, analyze what it teaches, and connect it back to the slide/page/concept where the link appeared.
- Use the source structure wherever visible: parts, sections, headings, tables, transcript sequence, examples, or diagrams.
- If examples exist inside the source, include them. If no example exists, add a clearly labelled external real-world example and explain how it applies.
- Avoid generic filler such as “this is important for understanding”. Every paragraph should teach a specific point.
- For psychology lecture packs, include named theories, named researchers, named experiments, research question/method/result/meaning, diagrams/tables, and exam application.
- If a source contains lecture objectives, outline, or review questions, turn them into revision priorities and exam guidance.
- When there are multiple files, the final output must be much closer to detailed lecture notes than a summary.

Most likely source title/topic from explicit evidence: {title_hint}

Stable source identity list:
{chr(10).join(source_identity_lines)}

Professor source-card preanalysis for multi-source synthesis:
{source_digest_block if source_digest_block else "Not required for single-source mode."}

{build_multisource_instruction(source_units, postprocess_language)}

Consistency requirement:
- The same source must not become two different documents.
- If the source is a legislation page, preserve the exact act identity.
- If the source title says Partnership Law Act 2019, do NOT change it to Arms Legislation Act 2019 or any other act.
"""

        stored_summary = generate_reference_style_multisource_notes(source_units, preferred_language, depth_plan, selected_prompt_mode)

        stored_summary = enforce_requested_language(stored_summary, preferred_language)
        stored_summary = finalize_generated_summary(
            stored_summary,
            requested_language=preferred_language,
            generation_language=postprocess_language,
            source_context=combined_source_text,
            source_units=source_units,
            attach_visuals=True,
            protect_heading=True,
        )
        stored_sections = parse_sections(stored_summary)
        stored_title = make_notes_title(stored_summary, title_candidates)
        if len(source_units) >= 2:
            # Avoid naming the whole analysis after only the first file.
            shared_title_hint = detect_course_or_topic_title(combined_source_text[:5000]) or "Multi-Source Study Synthesis"
            if stored_title in title_candidates or len(stored_title) < 18:
                stored_title = shared_title_hint
        stored_title = localise_title_if_needed(stored_title, postprocess_language)
        stored_connections = generate_connections_from_sections(stored_sections)
        stored_mind_map = generate_ai_mind_map(stored_title, stored_sections, postprocess_language, depth)
        stored_source_identity = source_units[0].get("source_identity", "") if source_units else ""

        result = {
            "title": stored_title,
            "summary": stored_summary,
            "sections": stored_sections,
            "connections": stored_connections,
            "mind_map": stored_mind_map,
            "visual_gallery": build_visual_gallery(source_units),
            "primary_source_identity": stored_source_identity,
            "source_count": len(source_units),
            "sources": [
                {
                    "index": i + 1,
                    "display_name": unit.get("display_name", ""),
                    "title_candidate": unit.get("title_candidate", ""),
                    "source_identity": unit.get("source_identity", ""),
                    "url": unit.get("url", "") or unit.get("embedded_url", ""),
                    "embedded_url": unit.get("embedded_url", ""),
                    "text_excerpt": truncate_text(unit.get("text_excerpt", ""), 60000),
                }
                for i, unit in enumerate(source_units)
            ],
            "source_fingerprint": source_fingerprint,
            "detail_level": depth,
            "generation_depth": depth,
            "depth_label": depth_config.get("label", depth),
            "depth_reason": depth_plan.get("reason", ""),
            "detail_plan": {k: v for k, v in depth_plan.items() if k != "config"},
            "output_language": postprocess_language,
            "prompt_mode": selected_prompt_mode,
            "prompt_mode_label": selected_prompt_label,
            "cached": False,
        }
        # Do not persist large base64 visual images in the JSON cache. The
        # current response can show them, but cached notes stay lightweight.
        cache_result = {**result, "visual_gallery": []}
        cache_set(source_fingerprint, cache_result)
        return result

    except Exception as error:
        return {"error": str(error)}


# -------------------------
# Tutor language + external research helpers
# -------------------------
def detect_question_language(question: str, fallback_language: str = "auto") -> str:
    """Lightweight language detector for tutor replies.
    The tutor should answer in the language used by the user's current question,
    not necessarily the language used for the generated notes.
    """
    q = question or ""
    if re.search(r"[\u4e00-\u9fff]", q):
        # Chinese characters are enough for choosing Chinese output; simplify by default.
        return "Simplified Chinese"
    if re.search(r"[\u3040-\u30ff]", q):
        return "Japanese"
    if re.search(r"[\uac00-\ud7af]", q):
        return "Korean"
    if re.search(r"[\u0600-\u06ff]", q):
        return "Arabic"
    if re.search(r"[\u0900-\u097f]", q):
        return "Hindi"
    if re.search(r"[\u0e00-\u0e7f]", q):
        return "Thai"
    if re.search(r"[\u0400-\u04ff]", q):
        return "Russian"

    # For Latin-script languages, let the model infer from the user text.
    # This avoids false certainty between English/French/Spanish/etc.
    if q.strip():
        return "the same language as the user's latest question"

    language_name = target_language_name(fallback_language)
    return language_name or "the same language as the user's latest question"


def safe_unquote_duckduckgo_url(url: str) -> str:
    parsed = urlparse(url or "")
    if "duckduckgo.com" in parsed.netloc and parsed.path.startswith("/l/"):
        qs = parse_qs(parsed.query)
        if qs.get("uddg"):
            return qs["uddg"][0]
    return url


def search_web_duckduckgo(query: str, max_results: int = 4) -> List[dict]:
    """Small no-key web search fallback for tutor mode.
    For production you can replace this with SerpAPI/Tavily/Brave Search, but this keeps
    the local prototype functional without another paid API.
    """
    query = normalise_space(query)
    if not query or not ENABLE_TUTOR_WEB_RESEARCH:
        return []

    search_url = "https://duckduckgo.com/html/?" + urlencode({"q": query})
    request = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        raw = urlopen_bytes(request, timeout=15, max_bytes=2_000_000)
        html = raw.decode("utf-8", errors="ignore")
    except Exception:
        return []

    results: List[dict] = []
    seen = set()

    if BeautifulSoup is not None:
        soup = BeautifulSoup(html, "html.parser")
        for link in soup.select("a.result__a"):
            title = clean_html(str(link))
            href = safe_unquote_duckduckgo_url(link.get("href") or "")
            if not title or not href or href in seen:
                continue
            seen.add(href)
            snippet = ""
            parent = link.find_parent(class_="result")
            if parent:
                snippet_tag = parent.select_one(".result__snippet")
                if snippet_tag:
                    snippet = normalise_space(snippet_tag.get_text(" ", strip=True))
            results.append({"title": title, "url": href, "snippet": snippet})
            if len(results) >= max_results:
                break
    else:
        for match in re.finditer(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, flags=re.I | re.S):
            href = safe_unquote_duckduckgo_url(match.group(1))
            title = clean_html(match.group(2))
            if title and href and href not in seen:
                seen.add(href)
                results.append({"title": title, "url": href, "snippet": ""})
            if len(results) >= max_results:
                break

    return results


def fetch_research_result_text(result: dict, max_chars: int = 2200) -> dict:
    url = result.get("url") or ""
    output = dict(result)
    output["content"] = ""
    if not url:
        return output
    try:
        url = normalize_public_http_url(url, "research result URL")
        raw = urlopen_bytes(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}),
            timeout=15,
            max_bytes=1_500_000,
        )
        html = raw.decode("utf-8", errors="ignore")
        content = extract_main_html_text(html) if "extract_main_html_text" in globals() else clean_html(html)
        output["content"] = truncate_text(content, max_chars)
    except Exception:
        output["content"] = result.get("snippet") or ""
    return output


def build_tutor_search_query(question: str, selected_section: str, source_identity: str, title: str) -> str:
    parts = [question or ""]
    if selected_section:
        parts.append(selected_section)
    if source_identity:
        parts.append(source_identity)
    elif title:
        parts.append(title)
    query = normalise_space(" ".join(parts))
    return query[:280]


def gather_tutor_web_research(question: str, selected_section: str, source_identity: str, title: str) -> Tuple[str, List[dict]]:
    """Search the web for additional context when the stored notes are incomplete.
    Returns a compact research context and result metadata.
    """
    if not ENABLE_TUTOR_WEB_RESEARCH:
        return "", []

    query = build_tutor_search_query(question, selected_section, source_identity, title)
    results = search_web_duckduckgo(query, max_results=MAX_TUTOR_SEARCH_RESULTS)
    enriched = []
    total = 0
    for item in results:
        enriched_item = fetch_research_result_text(item, max_chars=2400)
        content = enriched_item.get("content") or enriched_item.get("snippet") or ""
        total += len(content)
        enriched.append(enriched_item)
        if total >= MAX_TUTOR_RESEARCH_CHARS:
            break

    if not enriched:
        return "", []

    blocks = []
    for i, item in enumerate(enriched, 1):
        blocks.append(
            f"Source {i}: {item.get('title','Untitled')}\n"
            f"URL: {item.get('url','')}\n"
            f"Snippet: {item.get('snippet','')}\n"
            f"Extracted content: {truncate_text(item.get('content',''), 2400)}"
        )
    return "\n\n".join(blocks), enriched


def parse_json_list(value: str) -> List[dict]:
    try:
        parsed = json.loads(value or "[]")
    except Exception:
        return []
    return parsed if isinstance(parsed, list) else []


def parse_json_dict(value: str) -> dict:
    try:
        parsed = json.loads(value or "{}")
    except Exception:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def normalise_voice_tutor_history(history: List[dict]) -> List[dict]:
    turns: List[dict] = []
    for item in history or []:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role") or "").strip().lower()
        if role not in {"user", "assistant"}:
            continue
        text = normalise_space(str(item.get("text") or item.get("content") or ""))
        if not text:
            continue
        turn = {
            "role": role,
            "text": truncate_text(text, 1400),
        }
        if item.get("state"):
            turn["state"] = str(item.get("state"))
        if item.get("mastery") is not None:
            turn["mastery"] = item.get("mastery")
        turns.append(turn)
    return turns[-VOICE_TUTOR_HISTORY_LIMIT:]


def voice_tutor_context_from_sections(sections: dict, selected_section: str) -> str:
    if not isinstance(sections, dict):
        return ""
    if selected_section and sections.get(selected_section):
        return f"Selected section: {selected_section}\n{truncate_text(str(sections.get(selected_section)), 4500)}"
    blocks = []
    for title, content in list(sections.items())[:10]:
        text = normalise_space(str(content))
        if text:
            blocks.append(f"{title}: {truncate_text(text, 900)}")
    return "\n".join(blocks)


def normalise_voice_tutor_json(parsed: dict, fallback_reply: str, transcript: str, history: List[dict]) -> dict:
    if not isinstance(parsed, dict):
        parsed = {}
    try:
        mastery = int(float(parsed.get("mastery", 0)))
    except Exception:
        mastery = 0
    mastery = max(0, min(100, mastery))
    state = normalise_space(str(parsed.get("state") or "diagnose")).lower().replace("-", "_")
    if state not in {"diagnose", "teach", "practice", "hint", "review", "mastered"}:
        state = "diagnose"
    reply = normalise_space(str(parsed.get("reply") or fallback_reply or "Tell me what you understand so far, and I will guide you from there."))
    next_prompt = normalise_space(str(parsed.get("next_prompt") or ""))
    if state != "mastered" and not next_prompt:
        next_prompt = "Answer the next question in your own words."
    exercise = parsed.get("exercise") if isinstance(parsed.get("exercise"), dict) else {}
    exercise = {
        "type": normalise_space(str(exercise.get("type") or "short_answer")),
        "question": normalise_space(str(exercise.get("question") or next_prompt)),
        "expected_answer": normalise_space(str(exercise.get("expected_answer") or "")),
    }
    suggestions = parsed.get("suggested_actions") if isinstance(parsed.get("suggested_actions"), list) else []
    suggestions = [normalise_space(str(item)) for item in suggestions if normalise_space(str(item))][:4]
    if not suggestions:
        suggestions = ["Give me a hint", "Ask a simpler question", "Give me another example"]
        if state == "mastered" or mastery >= 85:
            suggestions.append("End session")
    can_end = bool(parsed.get("can_end")) or state == "mastered" or mastery >= 88
    return {
        "transcript": transcript,
        "reply": reply,
        "state": "mastered" if can_end and mastery >= 85 else state,
        "mastery": mastery,
        "student_level": normalise_space(str(parsed.get("student_level") or "unclear")),
        "diagnosis": normalise_space(str(parsed.get("diagnosis") or "")),
        "next_prompt": "" if can_end and mastery >= 85 else next_prompt,
        "hint": normalise_space(str(parsed.get("hint") or "")),
        "exercise": exercise,
        "can_end": can_end,
        "suggested_actions": suggestions,
        "turn_count": len(history) + (1 if transcript else 0),
    }


def realtime_tutor_instructions(
    title: str,
    note_summary: str,
    section_context: str,
    topic_title: str,
    topic_context: str,
    topic_scope: str,
    history: List[dict],
    preferred_language: str,
    source_identity: str,
) -> str:
    focused_topic = normalise_space(topic_title) or normalise_space(title) or "current study topic"
    focused_context = str(topic_context or "").strip() or str(section_context or "").strip()
    language_source_text = focused_context or note_summary or section_context
    resolved_language_key = resolve_generation_language_key(preferred_language, language_source_text)
    language_name = target_language_name(resolved_language_key)
    different_script_warning = (
        "If the transcript is a very short word in Chinese, Japanese, Korean, Arabic, or another writing system, "
        "treat it as a likely speech-recognition mistake. Ask the learner to repeat in English or type it."
        if resolved_language_key == "english" else
        "If a very short transcript appears in a different writing system from the lesson language, treat it as a likely speech-recognition mistake and ask the learner to repeat or type it."
    )
    recent_history = "\n".join(
        f"{turn.get('role', 'user')}: {normalise_space(str(turn.get('text', '')))}"
        for turn in history[-10:]
    ) or "No prior voice tutor turns."
    broader_note_context = truncate_text(note_summary, 2800 if focused_context else VOICE_TUTOR_REALTIME_CONTEXT_CHARS)
    return f"""
You are Synapse Realtime Voice Tutor, a live speech-to-speech academic tutor.

Voice persona:
- Sound like a young adult female academic tutor in a modern chat app.
- Warm, natural, gentle, curious, encouraging, and conversational.
- Use a light smile in the voice and small natural pauses.
- Do not sound like a narrator, audiobook reader, news anchor, customer-service bot, or corporate assistant.
- Avoid long monologues. Speak in short, human turns.

Language:
- Speak in {language_name}.
- Keep the session in {language_name}. Only switch languages if the learner gives a clear full sentence in another language.
- Do not switch languages because of one short anomalous transcript.
- {different_script_warning}
- Never translate the product name Synapse.

Current note:
Title: {normalise_space(title) or 'current study topic'}
Primary source identity: {source_identity or 'current uploaded material'}

Current focused topic:
Topic title: {focused_topic}
Topic scope: {normalise_space(topic_scope) or 'current visible generated topic'}
Topic context:
{truncate_text(focused_context, 6500) if focused_context else 'No focused topic was sent. Use the note overview carefully.'}

Opening line:
- On the first assistant turn of the live session, start exactly with: "Hi, I'm your Synapse tutor for {focused_topic}. We'll build this step by step."

Small broader-note guardrail:
{broader_note_context}

Conversation memory:
{recent_history}

Strict scope rule:
- Treat the Current focused topic as the primary lesson scope.
- Answer about this topic only. Use the broader-note guardrail only for one-sentence connections if helpful.
- Never ask what subject, course, material, or topic the learner is working on. You already know the focused topic above.
- If the learner says "I have no idea", "I don't know", "I'm lost", or gives a very short answer, start teaching the focused topic directly from basics. Do not ask them to pick a subject.
- If the learner asks something outside this generated topic, briefly say it is outside the current topic and bring them back to this topic.
- Do not lecture through the whole note unless the current topic is the whole note overview.
- Every assistant turn must end with exactly one clear next step: a short question, a prompt for the learner to continue explaining, or a mini-example for them to try. Never end a tutoring turn with only a statement.

Adaptive tutoring loop:
1. Start the session with the exact opening line above, then ask the learner what they already understand about that exact topic. Do not ask for the subject.
2. Listen to the learner's explanation and diagnose gaps.
3. Ask exactly one focused question or mini-example at a time.
4. If the learner is stuck or wrong, give a gentle hint or micro-lesson, then ask a simpler question.
5. If the learner is doing well, ask a transfer/application question using the uploaded source material.
6. Only end when the learner shows stable understanding across definition, source evidence/example, and application.
7. Do not say they have mastered it just because they say they are done.

When useful, mention the source evidence naturally, but do not read long notes aloud. Be interactive.
""".strip()


@app.post("/voice-tutor/realtime-call")
async def voice_tutor_realtime_call(
    sdp: str = Form(...),
    history: str = Form(default="[]"),
    title: str = Form(default=""),
    summary: str = Form(default=""),
    sections: str = Form(default="{}"),
    selected_section: str = Form(default=""),
    topic_title: str = Form(default=""),
    topic_context: str = Form(default=""),
    topic_scope: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    voice_input_language: str = Form(default=""),
    source_identity: str = Form(default=""),
):
    try:
        require_openai()
        parsed_history = normalise_voice_tutor_history(parse_json_list(history))
        sections_dict = parse_json_dict(sections)
        note_summary = str(summary or "").strip()
        focused_topic_context = str(topic_context or "").strip()
        if not note_summary and not sections_dict and not focused_topic_context:
            return Response(
                content=json.dumps({"error": "No current note context was provided. Open or generate the note before starting voice tutor."}),
                media_type="application/json",
                status_code=400,
            )

        section_context = voice_tutor_context_from_sections(sections_dict, selected_section)
        language_source_text = focused_topic_context or section_context or note_summary
        transcription_language = realtime_transcription_language_code(
            preferred_language=preferred_language,
            source_text=language_source_text,
            explicit_language=voice_input_language,
        )
        transcription_config = {"model": TRANSCRIBE_MODEL}
        if transcription_language:
            transcription_config["language"] = transcription_language
        session_config = {
            "type": "realtime",
            "model": REALTIME_MODEL,
            "output_modalities": ["audio"],
            "instructions": realtime_tutor_instructions(
                title=title,
                note_summary=note_summary,
                section_context=section_context,
                topic_title=topic_title,
                topic_context=focused_topic_context,
                topic_scope=topic_scope,
                history=parsed_history,
                preferred_language=preferred_language,
                source_identity=source_identity,
            ),
            "audio": {
                "output": {"voice": REALTIME_VOICE},
                "input": {
                    "transcription": transcription_config,
                    "noise_reduction": {"type": "near_field"},
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.45,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 650,
                        "create_response": True,
                        "interrupt_response": True,
                    },
                },
            },
        }
        headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        if OPENAI_ORG_ID:
            headers["OpenAI-Organization"] = OPENAI_ORG_ID
        if OPENAI_PROJECT_ID:
            headers["OpenAI-Project"] = OPENAI_PROJECT_ID
        response = requests.post(
            "https://api.openai.com/v1/realtime/calls",
            headers=headers,
            files={
                "sdp": (None, sdp),
                "session": (None, json.dumps(session_config)),
            },
            timeout=30,
        )
        if response.status_code >= 400:
            return Response(
                content=response.text,
                media_type=response.headers.get("content-type", "text/plain"),
                status_code=response.status_code,
            )
        return Response(
            content=response.text,
            media_type="application/sdp",
            headers={"Cache-Control": "no-store"},
        )
    except Exception as error:
        return Response(
            content=json.dumps({"error": str(error)}),
            media_type="application/json",
            status_code=500,
        )


@app.post("/voice-tutor/respond")
async def voice_tutor_respond(
    audio: Optional[UploadFile] = File(default=None),
    transcript: str = Form(default=""),
    history: str = Form(default="[]"),
    title: str = Form(default=""),
    summary: str = Form(default=""),
    sections: str = Form(default="{}"),
    selected_section: str = Form(default=""),
    preferred_language: str = Form(default="auto"),
    source_identity: str = Form(default=""),
):
    try:
        require_openai()
        parsed_history = normalise_voice_tutor_history(parse_json_list(history))
        sections_dict = parse_json_dict(sections)
        note_summary = str(summary or "").strip()
        if not note_summary and not sections_dict:
            return {"error": "No current note context was provided. Open or generate the note before starting voice tutor."}

        transcript_text = normalise_space(transcript)
        if audio is not None and audio.filename:
            audio_bytes = await read_upload_bytes(audio, MAX_AUDIO_BYTES, audio.filename or "voice audio")
            if audio_bytes:
                transcript_text = normalise_space(transcribe_media_bytes(audio.filename, audio_bytes))
        is_opening_turn = not transcript_text and not parsed_history

        section_context = voice_tutor_context_from_sections(sections_dict, selected_section)
        topic = normalise_space(title) or "the current study topic"
        language_source_text = note_summary or section_context
        answer_language = (
            detect_question_language(transcript_text, preferred_language)
            if transcript_text else
            target_language_name(resolve_generation_language_key(preferred_language, language_source_text))
        )
        history_lines = "\n".join(
            f"{turn['role']}: {turn['text']}" + (f" [state={turn.get('state')}, mastery={turn.get('mastery')}]" if turn.get("state") else "")
            for turn in parsed_history[-VOICE_TUTOR_HISTORY_LIMIT:]
        ) or "No prior voice tutor turns."
        opening_instruction = (
            "This is the opening turn. Ask the learner to explain what they already understand about the topic before teaching. "
            "Do not lecture yet. Give a warm, short diagnostic prompt."
            if is_opening_turn else
            "Evaluate the learner's latest answer, then decide whether to teach, hint, ask a simpler question, ask a harder transfer question, or end."
        )

        prompt = f"""
You are Synapse Voice Tutor, an adaptive spoken academic tutor.

Speak in: {answer_language}
Never translate the product name Synapse.

Current note:
Title: {topic}
Primary source identity: {source_identity or 'current uploaded material'}
Selected section context:
{section_context[:5000] if section_context else 'Full note context is used.'}

Generated notes context:
{truncate_text(note_summary, VOICE_TUTOR_CONTEXT_CHARS)}

Voice tutor conversation so far:
{history_lines}

Latest learner answer transcript:
{transcript_text or '[No learner answer yet]'}

Tutor mission:
- Start by asking what the learner already understands about this topic.
- Use the learner's first explanation as a diagnostic baseline.
- Keep asking one focused question or example at a time.
- If the learner is vague, wrong, or stuck, give a hint, a simpler question, or a short micro-lesson before asking again.
- If the learner is doing well, ask a harder transfer/example question, not just recall.
- End only when the learner has shown stable understanding across definition, evidence/example, and application.
- Do not mark mastery just because the learner says they are done.
- Keep the reply speakable: short paragraphs, no markdown tables, no long lists.
- Write the reply like a natural voice-chat script from a warm young female academic tutor. Use conversational phrasing, not textbook prose.
- In English, use natural contractions where appropriate. Do not use headings like "Diagnosis:" or "Question:" in the spoken reply.
- Use the source notes as the authority. Do not invent facts outside the uploaded material.
- Ask exactly one main question at the end unless can_end is true.
- If can_end is true, give a brief mastery summary and tell the learner they can finish or ask for one final challenge.

Current instruction:
{opening_instruction}

Return JSON only:
{{
  "reply": "what the voice tutor should say aloud",
  "state": "diagnose | teach | practice | hint | review | mastered",
  "mastery": 0,
  "student_level": "unclear | beginner | developing | secure | strong",
  "diagnosis": "brief private-facing diagnosis for UI",
  "next_prompt": "the one question the learner should answer next, empty if mastered",
  "hint": "short hint if useful",
  "exercise": {{"type":"short_answer | explain | example | compare | apply | correct_mistake","question":"...","expected_answer":"..."}},
  "can_end": false,
  "suggested_actions": ["Give me a hint", "Ask a simpler question", "Give me another example"]
}}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT + "\n\nYou are running a spoken tutoring loop. Return compact JSON only."},
                {"role": "user", "content": prompt},
            ],
            model=CHAT_MODEL,
            temperature=0.25,
            max_tokens=VOICE_TUTOR_TOKENS,
        )
        try:
            parsed = extract_json_object(raw)
        except Exception:
            parsed = {}
        fallback = "Tell me what you already understand about this topic. Start with the main idea, then one example or source detail you remember."
        return normalise_voice_tutor_json(parsed, fallback, transcript_text, parsed_history)
    except Exception as error:
        return {"error": str(error)}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    return await analyze_materials(files=[file], links="[]", free_text="", preferred_language="auto", client_fingerprint="")
