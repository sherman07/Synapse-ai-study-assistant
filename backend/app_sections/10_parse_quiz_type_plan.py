def parse_quiz_type_plan(data: dict) -> List[dict]:
    raw_types = data.get("question_types") or data.get("types") or []
    plan: List[dict] = []
    if isinstance(raw_types, list):
        for item in raw_types:
            if isinstance(item, dict):
                qtype = normalise_quiz_type(item.get("type") or item.get("value") or item.get("label"))
                count = clamp_quiz_count(item.get("count"), 1)
            else:
                qtype = normalise_quiz_type(str(item))
                count = 1
            plan.append({"type": qtype, "count": count})

    if not plan:
        total = clamp_quiz_count(data.get("total_questions") or data.get("question_count"), 6)
        plan = []
        remaining = total
        for item in DEFAULT_QUIZ_TYPE_PLAN:
            if remaining <= 0:
                break
            count = min(item["count"], remaining)
            plan.append({"type": item["type"], "count": count})
            remaining -= count
        if remaining > 0:
            plan.append({"type": "worked_problem", "count": remaining})

    max_questions = env_int("QUIZ_MAX_QUESTIONS", 30)
    trimmed: List[dict] = []
    used = 0
    for item in plan:
        if used >= max_questions:
            break
        count = min(item["count"], max_questions - used)
        if count > 0:
            trimmed.append({"type": item["type"], "count": count})
            used += count
    return trimmed or list(DEFAULT_QUIZ_TYPE_PLAN)


def expand_quiz_type_plan(plan: List[dict]) -> List[str]:
    desired: List[str] = []
    for item in plan:
        desired.extend([item["type"]] * item["count"])
    return desired


def quiz_sections_context(sections_payload) -> str:
    source = sections_payload if isinstance(sections_payload, dict) and sections_payload else stored_sections
    if not isinstance(source, dict):
        return ""
    blocks = []
    for name, content in list(source.items())[:12]:
        blocks.append(f"## {normalise_space(name)}\n{truncate_text(str(content or ''), 2600)}")
    return "\n\n".join(blocks)


def quiz_summary_context(data: dict) -> str:
    summary = data.get("summary") or stored_summary or ""
    sections_context = quiz_sections_context(data.get("sections"))
    combined = f"{summary}\n\n{sections_context}".strip()
    combined = re.sub(r"\[\[VISUAL:\d+\]\]", "[source image inserted in notes]", combined)
    return truncate_text(combined, env_int("QUIZ_CONTEXT_CHARS", 70000))


# -----------------------------------------------------------------------------
# Visual guide generation
# -----------------------------------------------------------------------------

VISUAL_GUIDE_PANEL_TYPES = {
    "concept",
    "process",
    "comparison",
    "evidence",
    "formula",
    "timeline",
    "case",
    "source",
}
ENABLE_VISUAL_GUIDE_WEB_IMAGES = os.getenv("ENABLE_VISUAL_GUIDE_WEB_IMAGES", "true").lower() not in {"0", "false", "no"}
VISUAL_GUIDE_WEB_IMAGE_LIMIT = env_int("VISUAL_GUIDE_WEB_IMAGE_LIMIT", 3)
WIKIMEDIA_COMMONS_API = "https://commons.wikimedia.org/w/api.php"


def visual_guide_source_context(data: dict) -> str:
    sources = data.get("sources") if isinstance(data.get("sources"), list) else []
    if not sources:
        return ""
    rows = []
    for index, source in enumerate(sources[:16], start=1):
        if not isinstance(source, dict):
            continue
        title = normalise_space(source.get("title_candidate") or source.get("display_name") or f"Source {index}")
        excerpt = truncate_text(normalise_space(source.get("text_excerpt") or ""), 1200)
        rows.append(f"Source {index}: {title}\n{excerpt}")
    return "\n\n".join(rows)


def visual_guide_figure_context(data: dict) -> str:
    figures = data.get("visual_gallery") if isinstance(data.get("visual_gallery"), list) else []
    rows = []
    for index, item in enumerate(figures[:18]):
        if not isinstance(item, dict):
            continue
        title = normalise_space(item.get("title") or item.get("caption") or f"Source figure {index + 1}")
        kind = normalise_space(item.get("visual_kind") or "")
        evidence = normalise_space(item.get("what_shows") or item.get("argument_supported") or item.get("caption") or "")
        rows.append(f"Source figure {index + 1} (index {index}, {kind}): {title}. {truncate_text(evidence, 420)}")
    return "\n".join(rows)


def visual_image_guide_diagram_rules(context: str) -> str:
    rules = []
    if re.search(r"\bmoney market\b|money demand|money supply|quantity of money|\bM_d\b|\bM_s\b", context or "", flags=re.I):
        rules.append(
            "Money market graph: vertical axis must be Interest rate (i), horizontal axis must be Quantity of money (M). "
            "Draw money supply as a vertical line labelled Ms. Draw money demand as a downward-sloping curve labelled Md. "
            "Never label the downward-sloping money-demand curve as Ms. If showing a supply shift, use Ms and Ms' only for vertical supply lines."
        )
    if re.search(r"loanable funds|real interest|saving|investment", context or "", flags=re.I):
        rules.append(
            "Loanable-funds graph: vertical axis must be Real interest rate (r), horizontal axis must be Loanable funds. "
            "Draw supply/saving as an upward-sloping curve labelled S and demand/investment as a downward-sloping curve labelled D."
        )
    if re.search(r"fisher effect|nominal|expected inflation|π|inflation", context or "", flags=re.I):
        rules.append(
            "Fisher effect: show i ≈ r + πe or i ≈ r + π^e, with i as nominal rate, r as real rate, and πe as expected inflation. "
            "Do not replace πe with unrelated letters."
        )
    if re.search(r"MV\s*=|quantity theory|velocity|nominal GDP|price.*output", context or "", flags=re.I):
        rules.append(
            "Quantity theory: show MV = PY with M = money supply, V = velocity, P = price level, and Y = real output. "
            "Keep these four labels distinct."
        )
    if re.search(r"reserve|multiplier|deposit|fractional", context or "", flags=re.I):
        rules.append(
            "Money multiplier: if shown, use multiplier = 1/r and deposit expansion = D/r or ΔM = D/r. "
            "Make r the reserve ratio, not the interest rate, in this specific block."
        )
    if not rules:
        return "Use any diagrams from the source accurately. Check every axis, curve, arrow, symbol, and label before finalizing the image."
    return "\n".join(f"- {rule}" for rule in rules)


def visual_image_guide_prompt(title: str, context: str, source_context: str, figure_context: str, preferred_language: str) -> str:
    language_rule = quiz_language_instruction(preferred_language)
    diagram_rules = visual_image_guide_diagram_rules(context)
    return f"""
Create a single finished educational visual image guide as a highly detailed polished portrait poster.

This is NOT an HTML card layout and NOT a wireframe. The output should be one real generated image: a coherent study poster / infographic that visually teaches the source.

Language requirement for any visible text: {language_rule}
Topic/title: {title}

Mandatory diagram accuracy rules:
{diagram_rules}

Design goals:
- Use a clean modern academic infographic style, suitable for a university study guide, with rich visual hierarchy and a premium textbook-poster feel.
- Make the image information-rich and visually explanatory: layered diagrams, arrows, formula tiles, mini charts, icon metaphors, callouts, flow relationships, and small annotated scenes.
- Include 8-10 core ideas from the notes, arranged as a connected visual map rather than isolated boxes.
- Use concise readable labels, not paragraphs. Text should be large enough to read; never use tiny dense footnotes.
- Add multiple visual detail zones: a central concept map, a process/causal flow, a formula/equation strip, a source-evidence strip, and a quick revision checklist.
- If formulas are important, show the most essential formulas, such as MV = PY or i ≈ r + πᵉ, as large clean formula tiles with nearby visual annotations.
- Include a clearly labelled worked-example area if examples/calculations exist in the notes, with givens, operation arrow, and result.
- Use subject-specific imagery and micro-illustrations, not generic decoration. For economics, prefer money-market curves, reserves/banking flows, central-bank policy arrows, quantity-theory formula blocks, Fisher-effect rate arrows, and loanable-funds contrasts when supported by the notes.
- Do not imitate the current website UI. Do not draw browser chrome, buttons, cards from the app, or screenshots.
- Avoid malformed mathematical notation. Keep equations short, clean, and visually separated.
- Before finalizing, visually audit labels for diagram correctness. If a graph contains both supply and demand, make sure their labels are not duplicated or swapped.
- Use source-grounded content only; do not invent facts outside the notes.

Generated notes:
{truncate_text(context, env_int("VISUAL_IMAGE_GUIDE_CONTEXT_CHARS", 18000))}

Source metadata / excerpts:
{truncate_text(source_context or "No separate source metadata supplied.", 5000)}

Available source figures:
{truncate_text(figure_context or "No source figures supplied.", 3500)}
""".strip()


@app.post("/visual-image-guide/generate")
async def generate_visual_image_guide(data: dict):
    try:
        require_openai()
        data = data or {}
        title = clean_quiz_string(data.get("title"), stored_title or "Study Material")
        context = quiz_summary_context(data)
        if not context:
            return {"error": "No generated notes are available for visual image guide generation yet."}

        requested_language = data.get("preferred_language", "auto")
        preferred_language = (
            resolve_generation_language_key("auto", context)
            if normalise_language_key(requested_language) == "auto"
            else normalise_quiz_language(requested_language)
        )
        source_context = visual_guide_source_context(data)
        figure_context = visual_guide_figure_context(data)
        prompt = visual_image_guide_prompt(title, context, source_context, figure_context, preferred_language)

        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        if OPENAI_ORG_ID:
            headers["OpenAI-Organization"] = OPENAI_ORG_ID
        if OPENAI_PROJECT_ID:
            headers["OpenAI-Project"] = OPENAI_PROJECT_ID

        payload = {
            "model": VISUAL_IMAGE_GUIDE_MODEL,
            "prompt": prompt,
            "n": 1,
            "size": VISUAL_IMAGE_GUIDE_SIZE,
            "quality": VISUAL_IMAGE_GUIDE_QUALITY,
            "output_format": "png",
        }
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=payload,
            timeout=env_int("VISUAL_IMAGE_GUIDE_TIMEOUT_SECONDS", 240),
        )
        if not response.ok:
            try:
                detail = response.json()
            except Exception:
                detail = response.text
            return {"error": f"Image generation failed with status {response.status_code}: {truncate_text(str(detail), 800)}"}

        parsed = response.json()
        image_items = parsed.get("data") if isinstance(parsed, dict) else []
        image_b64 = ""
        if isinstance(image_items, list) and image_items:
            image_b64 = str((image_items[0] or {}).get("b64_json") or "").strip()
        if not image_b64:
            return {"error": "Image generation response did not include image data."}

        return {
            "title": title,
            "image_data_url": f"data:image/png;base64,{image_b64}",
            "model": VISUAL_IMAGE_GUIDE_MODEL,
            "size": VISUAL_IMAGE_GUIDE_SIZE,
            "quality": VISUAL_IMAGE_GUIDE_QUALITY,
            "created": parsed.get("created"),
        }
    except Exception as error:
        return {"error": str(error)}


def fetch_image_data_url(url: str, max_bytes: int = 320_000) -> str:
    try:
        url = normalize_public_http_url(url, "visual guide image URL")
        data = urlopen_bytes(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Synapse visual guide)"}),
            timeout=12,
            max_bytes=max_bytes + 1,
        )
    except Exception:
        return ""
    if not data or len(data) > max_bytes:
        return ""
    mime = mimetypes.guess_type(urlparse(url).path)[0] or "image/jpeg"
    if mime not in {"image/jpeg", "image/png", "image/webp", "image/gif"}:
        return ""
    return f"data:{mime};base64,{base64.b64encode(data).decode('ascii')}"


def commons_metadata_value(metadata: dict, key: str) -> str:
    raw = metadata.get(key) if isinstance(metadata, dict) else None
    if isinstance(raw, dict):
        return normalise_space(clean_html(str(raw.get("value") or "")))
    return normalise_space(clean_html(str(raw or "")))


def search_wikimedia_commons_images(query: str, limit: int = 2) -> List[dict]:
    query = normalise_space(query)
    if not query:
        return []
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrsearch": query,
        "gsrlimit": str(max(3, limit * 4)),
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata",
        "iiurlwidth": "520",
    }
    url = WIKIMEDIA_COMMONS_API + "?" + urlencode(params)
    try:
        raw = urlopen_bytes(
            urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Synapse visual guide)"}),
            timeout=12,
            max_bytes=1_800_000,
        )
        payload = json.loads(raw.decode("utf-8", errors="ignore"))
    except Exception:
        return []

    results: List[dict] = []
    pages = (payload.get("query") or {}).get("pages") or {}
    for page in pages.values():
        if not isinstance(page, dict):
            continue
        imageinfo = (page.get("imageinfo") or [{}])[0]
        if not isinstance(imageinfo, dict):
            continue
        mime = imageinfo.get("mime") or ""
        if not str(mime).startswith("image/"):
            continue
        thumb_url = imageinfo.get("thumburl") or imageinfo.get("url") or ""
        if not thumb_url:
            continue
        data_url = fetch_image_data_url(thumb_url)
        if not data_url:
            continue
        title = normalise_space(str(page.get("title") or "")).replace("File:", "")
        metadata = imageinfo.get("extmetadata") or {}
        credit = commons_metadata_value(metadata, "Artist") or commons_metadata_value(metadata, "Credit")
        license_name = commons_metadata_value(metadata, "LicenseShortName") or commons_metadata_value(metadata, "UsageTerms")
        results.append({
            "title": truncate_text(title or query, 90),
            "url": data_url,
            "source_url": imageinfo.get("descriptionurl") or imageinfo.get("url") or thumb_url,
            "provider": "Wikimedia Commons",
            "credit": truncate_text(credit, 120),
            "license": truncate_text(license_name, 80),
            "query": truncate_text(query, 80),
        })
        if len(results) >= limit:
            break
    return results


def collect_visual_guide_web_images(title: str, parsed: dict, panels: List[dict], limit: int = VISUAL_GUIDE_WEB_IMAGE_LIMIT) -> List[dict]:
    if not ENABLE_VISUAL_GUIDE_WEB_IMAGES or limit <= 0:
        return []
    queries = clean_visual_guide_list(parsed.get("image_queries") if isinstance(parsed, dict) else [], 4, 80)
    if not queries:
        queries = [title]
        queries.extend(panel.get("title", "") for panel in panels[:4] if isinstance(panel, dict))
    output: List[dict] = []
    seen_urls = set()
    for query in queries:
        for item in search_wikimedia_commons_images(query, limit=1):
            source_url = item.get("source_url") or item.get("url")
            if not source_url or source_url in seen_urls:
                continue
            seen_urls.add(source_url)
            item["index"] = len(output)
            output.append(item)
            if len(output) >= limit:
                return output
    return output


def clamp_visual_guide_panel_type(value: str) -> str:
    key = normalise_space(str(value or "concept")).lower().replace("-", "_").replace(" ", "_")
    return key if key in VISUAL_GUIDE_PANEL_TYPES else "concept"


def clean_visual_guide_list(value, limit: int = 6, item_limit: int = 180) -> List[str]:
    if isinstance(value, str):
        raw_items = re.split(r"\n+|;\s*", value)
    elif isinstance(value, list):
        raw_items = value
    else:
        raw_items = []
    cleaned = [truncate_text(clean_quiz_rich_text(item), item_limit) for item in raw_items if clean_quiz_rich_text(item)]
    return cleaned[:limit]


VISUAL_GUIDE_HEADING_ONLY_RE = re.compile(
    r"^(?:#{1,4}\s*)?(?:Learning Question|Source and Argument Map|Core Notes|Key Terms(?: and Mechanisms)?|"
    r"Concepts Explained(?: With Source Evidence)?|Reading the Source Evidence|Worked Examples(?: and Evidence)?|"
    r"Source Evidence(?:\s*/\s*Example Matrix)?|Evidence Matrix|Exam Strategy(?: and Common Mistakes)?|Revision Checklist)\s*$",
    flags=re.I,
)


def clean_visual_guide_text(value: str) -> str:
    text = clean_quiz_rich_text(value, "")
    text = re.sub(r"\btotaldeposits\b", "total deposits", text, flags=re.I)
    text = re.sub(r"\bpotential(\d+(?:\.\d+)?\s*[KMBT])\b", r"potential $\1", text, flags=re.I)
    return normalise_space(text)


def is_visual_guide_heading_only(value: str) -> bool:
    return bool(VISUAL_GUIDE_HEADING_ONLY_RE.match(clean_visual_guide_text(value)))


def visual_guide_worked_example_panel(context: str) -> Optional[dict]:
    if not re.search(r"worked example|examples? from source|source exercise|D\s*=|V\s+fell|r\s*=|≈|%", context or "", flags=re.I):
        return None
    lines = [
        clean_visual_guide_text(re.sub(r"^\s*(?:#{1,4}|[-*])\s*", "", line))
        for line in (context or "").splitlines()
    ]
    lines = [
        line for line in lines
        if 18 <= len(line) <= 180 and not is_visual_guide_heading_only(line)
    ]
    example_lines = [
        line for line in lines
        if re.search(r"example|exercise|if\s+[A-Z]|D\s*=|V\s+fell|r\s*=|≈|%|→|\d+\s*[+\-*/]\s*\d+", line, flags=re.I)
    ]
    body = (example_lines or lines or [""])[0]
    if not body:
        return None
    return {
        "id": "vg-panel-worked-example",
        "kicker": "Worked example",
        "title": "Worked Example",
        "body": truncate_text(body, 240),
        "key_points": [truncate_text(item, 90) for item in (example_lines[1:3] if example_lines else lines[1:3])],
        "source_evidence": "Worked/example section in generated notes",
        "visual_type": "case",
        "visual_prompt": "small worked calculation card with givens, operation arrow, and result",
        "formula": "",
        "source_refs": ["Worked Examples and Evidence"],
        "source_figure_indexes": [],
        "web_image_indexes": [],
        "accent": "",
    }


def normalise_visual_guide(parsed: dict, title: str, context: str, sources: List[dict], figures: List[dict], web_images: Optional[List[dict]] = None) -> dict:
    if not isinstance(parsed, dict):
        parsed = {}
    raw_panels = parsed.get("panels") if isinstance(parsed.get("panels"), list) else []
    panels: List[dict] = []
    panel_limit = max(env_int("VISUAL_GUIDE_MAX_PANELS", 6), 7)
    for index, raw in enumerate(raw_panels[:panel_limit]):
        if not isinstance(raw, dict):
            continue
        panel_title = clean_quiz_string(clean_visual_guide_text(raw.get("title")), f"Key idea {index + 1}")
        body = clean_visual_guide_text(raw.get("body") or raw.get("explanation"))
        key_points = [clean_visual_guide_text(item) for item in clean_visual_guide_list(raw.get("key_points") or raw.get("points"), 2, 90)]
        evidence = clean_visual_guide_text(raw.get("source_evidence") or raw.get("evidence"))
        if is_visual_guide_heading_only(evidence):
            evidence = ""
        if not panel_title or not (body or key_points or evidence):
            continue
        figure_indexes = []
        for item in raw.get("source_figure_indexes") or raw.get("figure_indexes") or []:
            try:
                figure_index = int(item)
            except Exception:
                continue
            if 0 <= figure_index < len(figures) and figure_index not in figure_indexes:
                figure_indexes.append(figure_index)
        panels.append({
            "id": clean_quiz_string(raw.get("id"), f"vg-panel-{index + 1}"),
            "kicker": truncate_text(clean_quiz_string(clean_visual_guide_text(raw.get("kicker") or raw.get("label")), f"Part {index + 1}"), 28),
            "title": truncate_text(panel_title, 58),
            "body": truncate_text(body, 240),
            "key_points": key_points,
            "source_evidence": truncate_text(evidence, 160),
            "visual_type": clamp_visual_guide_panel_type(raw.get("visual_type") or raw.get("type")),
            "visual_prompt": truncate_text(clean_visual_guide_text(raw.get("visual_prompt") or raw.get("visual")), 130),
            "formula": truncate_text(clean_visual_guide_text(raw.get("formula")), 140),
            "source_refs": clean_visual_guide_list(raw.get("source_refs") or raw.get("source_references"), 3, 58),
            "source_figure_indexes": figure_indexes,
            "web_image_indexes": [],
            "accent": clean_quiz_string(raw.get("accent"), ""),
        })

    worked_panel = visual_guide_worked_example_panel(context)
    if worked_panel and not any(re.search(r"worked examples?", panel.get("title", ""), flags=re.I) for panel in panels):
        panels.append(worked_panel)

    if figures and panels:
        image_slot_limit = max(0, min(len(figures), env_int("VISUAL_GUIDE_IMAGE_SLOTS", 8)))
        used_figure_indexes = {
            figure_index
            for panel in panels
            for figure_index in panel.get("source_figure_indexes", [])
            if isinstance(figure_index, int)
        }
        unused_figure_indexes = [
            figure_index
            for figure_index in range(min(len(figures), image_slot_limit))
            if figure_index not in used_figure_indexes
        ]
        preferred_visual_types = {"source", "evidence", "case", "comparison", "process", "formula", "concept"}
        for panel in panels:
            if not unused_figure_indexes:
                break
            if panel.get("source_figure_indexes"):
                continue
            if panel.get("visual_type") not in preferred_visual_types:
                continue
            panel["source_figure_indexes"] = [unused_figure_indexes.pop(0)]

    if not panels:
        section_lines = [
            normalise_space(line.lstrip("#-0123456789. "))
            for line in context.splitlines()
            if 34 <= len(normalise_space(line.lstrip("#-0123456789. "))) <= 260
        ][:6]
        for index, line in enumerate(section_lines or [title]):
            panels.append({
                "id": f"vg-panel-{index + 1}",
                "kicker": f"Part {index + 1}",
                "title": truncate_text(line, 90),
            "body": truncate_text(line, 520),
                "key_points": [],
                "source_evidence": "",
                "visual_type": "concept",
                "visual_prompt": "",
                "formula": "",
            "source_refs": [],
            "source_figure_indexes": [],
            "web_image_indexes": [],
            "accent": "",
        })

    web_images = [item for item in (web_images or []) if isinstance(item, dict) and item.get("url")]
    if web_images and panels:
        web_cursor = 0
        for panel in panels:
            if web_cursor >= len(web_images):
                break
            if panel.get("source_figure_indexes"):
                continue
            panel["web_image_indexes"] = [web_cursor]
            web_cursor += 1

    raw_source_map = parsed.get("source_map") if isinstance(parsed.get("source_map"), list) else []
    source_map = []
    for index, raw in enumerate(raw_source_map[:16]):
        if not isinstance(raw, dict):
            continue
        source_map.append({
            "source": truncate_text(clean_quiz_string(raw.get("source"), f"Source {index + 1}"), 120),
            "role": truncate_text(clean_quiz_rich_text(raw.get("role"), ""), 220),
            "evidence": truncate_text(clean_quiz_rich_text(raw.get("evidence"), ""), 260),
        })
    if not source_map and sources:
        for index, source in enumerate(sources[:12], start=1):
            if not isinstance(source, dict):
                continue
            source_map.append({
                "source": truncate_text(clean_quiz_string(source.get("title_candidate") or source.get("display_name"), f"Source {index}"), 120),
                "role": "Provides source material for this visual guide.",
                "evidence": truncate_text(clean_quiz_rich_text(source.get("text_excerpt"), ""), 240),
            })

    return {
        "title": truncate_text(clean_quiz_string(parsed.get("title"), f"{title} Visual Guide"), 120),
        "subtitle": truncate_text(clean_quiz_rich_text(parsed.get("subtitle"), ""), 140),
        "thesis": truncate_text(clean_quiz_rich_text(parsed.get("thesis") or parsed.get("overview"), ""), 220),
        "coverage_note": truncate_text(clean_quiz_rich_text(parsed.get("coverage_note"), ""), 150),
        "panels": panels[:panel_limit],
        "flow": [
            {
                "label": truncate_text(clean_quiz_string(item.get("label"), f"Step {index + 1}"), 58),
                "text": truncate_text(clean_quiz_rich_text(item.get("text") or item.get("explanation"), ""), 180),
            }
            for index, item in enumerate(parsed.get("flow") if isinstance(parsed.get("flow"), list) else [])
            if isinstance(item, dict) and (item.get("label") or item.get("text") or item.get("explanation"))
        ][:4],
        "source_map": source_map,
        "review_prompts": clean_visual_guide_list(parsed.get("review_prompts"), 3, 110),
        "web_images": web_images,
    }


@app.post("/visual-guide/generate")
async def generate_visual_guide(data: dict):
    try:
        require_openai()
        data = data or {}
        title = clean_quiz_string(data.get("title"), stored_title or "Study Material")
        context = quiz_summary_context(data)
        source_context = visual_guide_source_context(data)
        figure_context = visual_guide_figure_context(data)
        if not context:
            return {"error": "No generated notes are available for visual guide generation yet."}
        requested_language = data.get("preferred_language", "auto")
        preferred_language = (
            resolve_generation_language_key("auto", context)
            if normalise_language_key(requested_language) == "auto"
            else normalise_quiz_language(requested_language)
        )

        language_rule = quiz_language_instruction(preferred_language)
        schema = """
Return JSON only with this exact shape. Keep keys in English; user-facing values must follow the language requirement:
{
  "title": "visual guide title",
  "subtitle": "one-line framing sentence",
  "thesis": "what this source is really teaching",
  "coverage_note": "how the guide covers the whole source",
  "flow": [{"label": "Step", "text": "short explanation"}],
  "panels": [
    {
      "kicker": "short label",
      "title": "panel title",
      "body": "main explanation",
      "key_points": ["point 1", "point 2"],
      "source_evidence": "specific source evidence, example, formula, table, figure, or claim",
      "visual_type": "concept | process | comparison | evidence | formula | timeline | case | source",
      "visual_prompt": "what the frontend should draw visually; include layout, icons, arrows, color zones, and image role",
      "formula": "optional MathJax formula",
      "source_refs": ["Source 1", "Source figure 2"],
      "source_figure_indexes": [0]
    }
  ],
  "source_map": [{"source": "Source name", "role": "what it contributes", "evidence": "specific evidence used"}],
  "review_prompts": ["what the student should be able to explain"],
  "image_queries": ["2-4 short web image search phrases for missing visuals"]
}
"""
        prompt = f"""
Create a high-quality visual study guide script from the user's generated notes and source evidence.

Language requirement: {language_rule}
Topic/title: {title}

Goal:
Make one simple, complete infographic poster, grounded in the user's source. It should be easy to understand at a glance, not a detailed notes page.

Coverage rules:
- Compress the source into the 4-6 ideas a student must remember first.
- If the source is large, group details under simple umbrella ideas instead of listing everything.
- Mention each source at least once in source_map when source metadata is available.
- Use source figures actively: when source figures are available, choose 2-4 distinct useful figures across the guide when possible.
- Use each selected source figure for a clear teaching purpose: "what to notice", "how it supports the point", or "how to read it".
- Do not repeat a source figure index in many panels unless it is the central image for the whole source.
- Do not invent content outside the source. Add only clarifying transitions.

Visual design script rules:
- Each panel must fit on an infographic card: title plus one short sentence, with at most two bullets.
- Keep source_evidence to one short concrete phrase.
- Do not put note section headings such as "Worked Examples and Evidence" or "Source evidence / example matrix" inside source_evidence; use the actual example, formula, data point, or claim instead.
- If the notes contain worked examples, calculations, or source exercises, include one panel titled "Worked Example".
- The visual_prompt should tell the frontend what to draw: source-image thumbnail, curve, arrows, comparison columns, evidence stack, process loop, formula tile, timeline, callout labels, or map.
- Prefer visual prompts that make the idea memorable: contrast left/right, cause-to-effect arrows, before/after, method-result-meaning, or formula-to-example.
- source_evidence must be concrete: a named concept, formula, example, visual/table/chart, study, quote idea, or source claim.
- image_queries should be short generic search phrases for educational/public-domain visuals if source figures are missing, e.g. "Piaget conservation task", "derivative tangent line graph", "EEG cap brain".
- For math, keep formulas MathJax-compatible. Put only formulas inside \\( ... \\) or \\[ ... \\), not normal prose.
- For academic/social science sources, include method-result-meaning or theory-evidence-limitation where relevant.
- For slides/PDFs, explain what the slide/source figure contributes, not just that an image exists.
- End with review prompts that help the student study from the visual.

{schema}

Generated notes context:
{context}

Source metadata/excerpts:
{source_context or "No separate source metadata was supplied."}

Available source figures:
{figure_context or "No source figures were supplied."}
"""
        raw = generate_chat(
            [
                {"role": "system", "content": "You generate structured infographic scripts as strict JSON. Never include markdown fences or prose outside JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("detailed"),
            temperature=float(os.getenv("VISUAL_GUIDE_TEMPERATURE", "0.25")),
            max_tokens=env_int("VISUAL_GUIDE_TOKENS", 6500),
        )
        parsed = extract_json_object(raw)
        prelim_guide = normalise_visual_guide(
            parsed or {},
            title,
            context,
            data.get("sources") if isinstance(data.get("sources"), list) else [],
            data.get("visual_gallery") if isinstance(data.get("visual_gallery"), list) else [],
            [],
        )
        web_images = collect_visual_guide_web_images(
            title,
            parsed or {},
            prelim_guide.get("panels") or [],
            VISUAL_GUIDE_WEB_IMAGE_LIMIT,
        )
        guide = normalise_visual_guide(
            parsed or {},
            title,
            context,
            data.get("sources") if isinstance(data.get("sources"), list) else [],
            data.get("visual_gallery") if isinstance(data.get("visual_gallery"), list) else [],
            web_images,
        )
        return guide
    except Exception as error:
        return {"error": str(error)}


# -----------------------------------------------------------------------------
# Timeline generation
# -----------------------------------------------------------------------------

TIMELINE_TYPE_ALIASES = {
    "warm_up": "warm_up",
    "overview": "warm_up",
    "flow": "warm_up",
    "lecture": "warm_up",
    "lecture_flow": "warm_up",
    "sequence": "warm_up",
    "learn": "learn",
    "concept": "learn",
    "definition": "learn",
    "mechanism": "learn",
    "method": "learn",
    "apply": "apply",
    "evidence": "apply",
    "data": "apply",
    "figure": "apply",
    "experiment": "apply",
    "study": "apply",
    "example": "apply",
    "case": "apply",
    "application": "apply",
    "check": "check",
    "exam": "check",
    "assessment": "check",
    "test": "check",
    "revise": "revise",
    "revision": "revise",
    "review": "revise",
    "mistake": "revise",
}


def normalise_timeline_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return TIMELINE_TYPE_ALIASES.get(key, "learn")


STUDY_PATH_QUESTION_TYPE_ALIASES = {
    "short": "short_answer",
    "short_answer": "short_answer",
    "short_response": "short_answer",
    "open": "short_answer",
    "open_ended": "short_answer",
    "single": "single_choice",
    "choice": "single_choice",
    "mcq": "single_choice",
    "single_choice": "single_choice",
    "multiple": "multiple_choice",
    "multi": "multiple_choice",
    "multiple_choice": "multiple_choice",
    "true_false": "true_false",
    "truefalse": "true_false",
    "tf": "true_false",
    "true_or_false": "true_false",
    "case": "case_analysis",
    "case_analysis": "case_analysis",
    "scenario": "case_analysis",
    "application": "case_analysis",
    "compare": "compare",
    "comparison": "compare",
    "compare_contrast": "compare",
    "essay": "essay_outline",
    "outline": "essay_outline",
    "essay_outline": "essay_outline",
    "diagram": "diagram_prompt",
    "figure": "diagram_prompt",
    "visual": "diagram_prompt",
    "graph": "diagram_prompt",
    "chart": "diagram_prompt",
    "diagram_prompt": "diagram_prompt",
}


def normalise_study_path_question_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return STUDY_PATH_QUESTION_TYPE_ALIASES.get(key, "short_answer")


def fallback_study_path_question(event_type: str, title: str, summary: str, source_reference: str = "") -> dict:
    clean_title = clean_quiz_string(title, "this checkpoint")
    clean_summary = clean_quiz_string(summary, "the key idea in this checkpoint")
    if event_type == "apply":
        qtype = "case_analysis"
        prompt = f"How does this evidence or example support the concept: {clean_title}?"
    elif event_type == "check":
        qtype = "essay_outline"
        prompt = f"What would be the first three points in an exam answer about {clean_title}?"
    elif event_type == "revise":
        qtype = "true_false"
        prompt = f"True or false: {clean_summary[:150]}"
    elif event_type == "learn":
        qtype = "short_answer"
        prompt = f"What does {clean_title} mean, and why is it important here?"
    else:
        qtype = "short_answer"
        prompt = f"What is the main question or goal of {clean_title}?"
    return {
        "type": qtype,
        "prompt": truncate_text(prompt, 280),
        "options": ["True", "False"] if qtype == "true_false" else [],
        "correct_option_indexes": [],
        "correct_boolean": True if qtype == "true_false" else None,
        "expected_answer": truncate_text(clean_summary, 420),
        "explanation": "A strong answer should use the task focus and connect it back to the notes, source evidence, or example.",
        "source_reference": truncate_text(source_reference or clean_title, 180),
    }


def normalise_study_path_practice_question(raw, fallback_event: dict, title: str, index: int) -> dict:
    fallback = fallback_event.get("practice_question") or fallback_study_path_question(
        normalise_timeline_type(fallback_event.get("type")),
        title or fallback_event.get("title") or f"Checkpoint {index + 1}",
        fallback_event.get("summary") or fallback_event.get("detail") or "",
        fallback_event.get("source_reference") or fallback_event.get("section") or "",
    )
    if isinstance(raw, str):
        source = {"prompt": raw}
    elif isinstance(raw, dict):
        source = raw
    else:
        source = {}

    qtype = normalise_study_path_question_type(
        source.get("type") or source.get("question_type") or source.get("questionType") or fallback.get("type")
    )
    prompt = clean_quiz_string(
        source.get("prompt") or source.get("question") or source.get("title"),
        fallback.get("prompt", ""),
    )
    options = source.get("options") if isinstance(source.get("options"), list) else source.get("choices")
    options = [clean_quiz_string(option) for option in options if clean_quiz_string(option)] if isinstance(options, list) else list(fallback.get("options") or [])
    options = options[:6]
    if qtype == "true_false" and len(options) < 2:
        options = ["True", "False"]
    if qtype not in {"single_choice", "multiple_choice", "true_false"}:
        options = []

    correct_indexes = coerce_option_indexes(
        source.get("correct_option_indexes", source.get("correctOptionIndexes", source.get("correct_indexes", source.get("answer_index", source.get("answer"))))),
        options,
    )
    fallback_indexes = fallback.get("correct_option_indexes") if isinstance(fallback.get("correct_option_indexes"), list) else []
    if qtype in {"single_choice", "multiple_choice"} and not correct_indexes:
        correct_indexes = [idx for idx in fallback_indexes if isinstance(idx, int) and 0 <= idx < len(options)]
    if qtype == "single_choice":
        correct_indexes = correct_indexes[:1]
    elif qtype == "multiple_choice" and len(correct_indexes) < 2 and len(options) >= 2:
        correct_indexes = correct_indexes or [0, 1]
    elif qtype not in {"single_choice", "multiple_choice"}:
        correct_indexes = []

    correct_boolean = coerce_boolean(source.get("correct_boolean", source.get("correctBoolean", source.get("answer"))))
    if qtype == "true_false" and correct_boolean is None:
        correct_boolean = coerce_boolean(fallback.get("correct_boolean"))
    if qtype != "true_false":
        correct_boolean = None

    return {
        "type": qtype,
        "prompt": truncate_text(prompt, 360),
        "options": [truncate_text(option, 180) for option in options],
        "correct_option_indexes": correct_indexes,
        "correct_boolean": correct_boolean,
        "expected_answer": truncate_text(clean_quiz_string(
            source.get("expected_answer") or source.get("expectedAnswer") or source.get("answer_guide") or source.get("answerGuide"),
            fallback.get("expected_answer", ""),
        ), 650),
        "explanation": truncate_text(clean_quiz_string(source.get("explanation") or source.get("rationale"), fallback.get("explanation", "")), 520),
        "source_reference": truncate_text(clean_quiz_string(
            source.get("source_reference") or source.get("sourceReference") or source.get("source"),
            fallback.get("source_reference", ""),
        ), 220),
    }


def fallback_timeline_from_context(title: str, sections: Dict[str, str], context: str) -> dict:
    ordered_names = list(sections.keys())[:10] if isinstance(sections, dict) else []
    if not ordered_names:
        snippets = [
            normalise_space(line.lstrip("#-0123456789. "))
            for line in context.splitlines()
            if len(normalise_space(line.lstrip("#-0123456789. "))) > 30
        ][:8]
        ordered_names = [f"Checkpoint {index + 1}" for index, _ in enumerate(snippets)]
        section_lookup = dict(zip(ordered_names, snippets))
    else:
        section_lookup = sections

    events = []
    for index, name in enumerate(ordered_names[:12]):
        text = section_lookup.get(name, "") if isinstance(section_lookup, dict) else ""
        summary = first_good_sentence(text, 180) or normalise_space(str(text))[:180] or "Review this stage in the notes."
        event_type = "warm_up"
        lowered = f"{name} {summary}".lower()
        if re.search(r"\b(table|figure|data|result|evidence|study|experiment|graph|chart)\b", lowered):
            event_type = "apply"
        elif re.search(r"\b(example|case|application)\b", lowered):
            event_type = "apply"
        elif re.search(r"\b(exam|revision|mistake|critical)\b", lowered):
            event_type = "check"
        elif re.search(r"\b(definition|concept|idea|method|model)\b", lowered):
            event_type = "learn"
        practice_question = fallback_study_path_question(event_type, name, summary, name)
        events.append({
            "id": sha256_text(f"{name}-{index}")[:10],
            "order": index + 1,
            "marker": f"Task {index + 1}",
            "type": event_type,
            "title": short_mindmap_text(name, 72),
            "section": name,
            "summary": summary,
            "detail": summary,
            "task": f"Read the section \"{short_mindmap_text(name, 80)}\" and write a two-sentence explanation. First state the main idea; then connect it to one source detail, example, or limitation from the notes.",
            "active_prompt": f"Without looking, explain the key idea from {name}.",
            "practice_question": practice_question,
            "deliverable": "A short explanation in your own words.",
            "mastery_check": "You can explain the idea and connect it to one piece of source evidence.",
            "estimated_minutes": 8,
            "priority": "medium",
            "evidence": "",
            "why_it_matters": "This checkpoint helps organise the material into a learnable sequence.",
            "misconception": "",
            "exam_use": "Use it as a revision checkpoint before moving to the next concept.",
            "source_reference": name,
            "related_terms": [],
        })

    return {
        "title": clean_quiz_string(title, stored_title or "Study Path"),
        "summary": "A task-based study path that moves from orientation to practice and exam-ready revision.",
        "events": events,
    }


def normalise_timeline(raw: dict, fallback: dict) -> dict:
    if not isinstance(raw, dict):
        raw = {}
    raw_events = raw.get("events") if isinstance(raw.get("events"), list) else []
    fallback_events = fallback.get("events", []) or []
    events: List[dict] = []
    for index, event in enumerate(raw_events[: env_int("TIMELINE_MAX_EVENTS", 16)]):
        if not isinstance(event, dict):
            continue
        fallback_event = fallback_events[min(index, len(fallback_events) - 1)] if fallback_events else {}
        title = clean_quiz_string(event.get("title") or event.get("label"), fallback_event.get("title", f"Checkpoint {index + 1}"))
        summary = clean_quiz_string(event.get("summary") or event.get("what_happens"), fallback_event.get("summary", ""))
        detail = clean_quiz_string(event.get("detail") or event.get("explanation") or event.get("why"), fallback_event.get("detail", summary))
        evidence = clean_quiz_string(event.get("evidence") or event.get("source_evidence"), fallback_event.get("evidence", ""))
        try:
            estimated_minutes = int(event.get("estimated_minutes") or event.get("estimatedMinutes") or fallback_event.get("estimated_minutes") or 8)
        except Exception:
            estimated_minutes = 8
        estimated_minutes = max(3, min(estimated_minutes, 60))
        if not title or not (summary or detail or evidence):
            continue
        related_terms = event.get("related_terms") or event.get("relatedTerms") or []
        if not isinstance(related_terms, list):
            related_terms = []
        events.append({
            "id": clean_quiz_string(event.get("id"), sha256_text(f"{title}-{index}")[:10]),
            "order": index + 1,
            "marker": clean_quiz_string(event.get("marker") or event.get("time") or event.get("step"), f"Step {index + 1}"),
            "type": normalise_timeline_type(event.get("type") or fallback_event.get("type")),
            "title": truncate_text(title, 140),
            "section": clean_quiz_string(event.get("section"), fallback_event.get("section", "")),
            "summary": truncate_text(summary, 420),
            "detail": truncate_text(detail, 900),
            "task": truncate_text(clean_quiz_string(event.get("task") or event.get("action") or event.get("study_task"), fallback_event.get("task", detail or summary)), 650),
            "active_prompt": truncate_text(clean_quiz_string(event.get("active_prompt") or event.get("recall_prompt"), fallback_event.get("active_prompt", "")), 520),
            "practice_question": normalise_study_path_practice_question(
                event.get("practice_question") or event.get("practiceQuestion") or event.get("question"),
                fallback_event,
                title,
                index,
            ),
            "deliverable": truncate_text(clean_quiz_string(event.get("deliverable") or event.get("output"), fallback_event.get("deliverable", "")), 420),
            "mastery_check": truncate_text(clean_quiz_string(event.get("mastery_check") or event.get("checkpoint"), fallback_event.get("mastery_check", "")), 420),
            "estimated_minutes": estimated_minutes,
            "priority": clean_quiz_string(event.get("priority"), fallback_event.get("priority", "medium")).lower(),
            "evidence": truncate_text(evidence, 700),
            "why_it_matters": truncate_text(clean_quiz_string(event.get("why_it_matters") or event.get("whyItMatters"), fallback_event.get("why_it_matters", "")), 520),
            "misconception": truncate_text(clean_quiz_string(event.get("misconception") or event.get("common_mistake"), fallback_event.get("misconception", "")), 420),
            "exam_use": truncate_text(clean_quiz_string(event.get("exam_use") or event.get("examUse"), fallback_event.get("exam_use", "")), 420),
            "source_reference": truncate_text(clean_quiz_string(event.get("source_reference") or event.get("source"), fallback_event.get("source_reference", "")), 220),
            "related_terms": [truncate_text(clean_quiz_string(term), 48) for term in related_terms if clean_quiz_string(term)][:6],
        })

    if len(events) < 3:
        events = fallback_events[: env_int("TIMELINE_MAX_EVENTS", 16)]
    return {
        "title": clean_quiz_string(raw.get("title"), fallback.get("title", "Study Path")),
        "summary": truncate_text(clean_quiz_string(raw.get("summary"), fallback.get("summary", "")), 520),
        "events": events,
    }
