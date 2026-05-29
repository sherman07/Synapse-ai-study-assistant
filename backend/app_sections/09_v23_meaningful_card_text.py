def _v23_meaningful_card_text(value: str) -> str:
    text = normalise_space(value or "")
    if not text:
        return ""
    if re.search(
        r"\b("
        r"direct support|nearby concept|uploaded material|source figure|visual evidence|"
        r"connect this source figure|main concept|other uploaded materials|read the labels/title first"
        r")\b",
        text,
        flags=re.I,
    ):
        return ""
    return clean_source_figure_caption(text)


def _v23_default_how_to_read(kind: str, preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    kind = normalise_space(kind or "")
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        mapping = {
            "data/table": "先看行列分别在比较什么，再抓住最大/最小值、均值/比例和组间差异；最后问这些数字支持或限制了哪个论点。",
            "graph/chart": "先读标题和坐标轴，再看趋势方向、组间差异、异常点和变量关系；不要只记图形，要说清它证明了什么。",
            "diagram/model": "按标签、箭头或空间位置读图：先确定组成部分，再解释它们之间的关系和机制。",
            "experiment/event": "先分清参与者、条件、步骤和结果，再说明这个实验设计如何检验一个理论假设。",
            "formula/calculation": "先识别每个变量代表什么，再看公式如何把变量关系转化为可计算的结论。",
            "method/result figure": "先看研究方法或测量对象，再把结果与讲义中的理论主张连接起来，同时注意样本和方法限制。",
        }
    elif key == "traditional_chinese":
        mapping = {
            "data/table": "先看行列分別在比較什麼，再抓住最大/最小值、均值/比例和組間差異；最後問這些數字支持或限制了哪個論點。",
            "graph/chart": "先讀標題和座標軸，再看趨勢方向、組間差異、異常點和變量關係；不要只記圖形，要說清它證明了什麼。",
            "diagram/model": "按標籤、箭頭或空間位置讀圖：先確定組成部分，再解釋它們之間的關係和機制。",
            "experiment/event": "先分清參與者、條件、步驟和結果，再說明這個實驗設計如何檢驗一個理論假設。",
            "formula/calculation": "先識別每個變量代表什麼，再看公式如何把變量關係轉化為可計算的結論。",
            "method/result figure": "先看研究方法或測量對象，再把結果與講義中的理論主張連接起來，同時注意樣本和方法限制。",
        }
    else:
        mapping = {
            "data/table": "Read the rows and columns first, then identify the key values, contrasts, and limits. Ask what claim the numbers support or qualify.",
            "graph/chart": "Read the title and axes first, then describe the trend, group difference, outlier, or variable relationship before interpreting it.",
            "diagram/model": "Follow the labels, arrows, or spatial layout: identify the parts, then explain the relationship or mechanism between them.",
            "experiment/event": "Identify the participants, conditions, sequence, and result, then explain how the design tests the theory.",
            "formula/calculation": "Identify what each variable means, then explain how the formula turns the relationship into a usable conclusion.",
            "method/result figure": "Read the method or measurement first, then connect the result to the lecture claim and note any sample or method limit.",
        }
    return mapping.get(kind, mapping.get("diagram/model", "Read the labels and relationship first, then connect the visual to the claim it is meant to support."))


def _v23_source_figure_note_block(card: dict, marker_index: int, preferred_language: str) -> str:
    key = normalise_language_key(preferred_language)
    title = _v23_meaningful_card_text(card.get("title")) or (f"来源图表 {marker_index + 1}" if key in {"simplified_chinese", "mixed_chinese_english"} else f"Source figure {marker_index + 1}")
    what = _v23_meaningful_card_text(card.get("what_shows")) or _v23_meaningful_card_text(card.get("caption"))
    why = _v23_meaningful_card_text(card.get("argument_supported")) or _v23_meaningful_card_text(card.get("cross_source_connection"))
    how = _v23_meaningful_card_text(card.get("how_to_read")) or _v23_default_how_to_read(card.get("visual_kind"), preferred_language)
    exam = _v23_meaningful_card_text(card.get("exam_use"))
    if key in {"simplified_chinese", "mixed_chinese_english"}:
        lines = [f"**源内图表讲解：{title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **图表在说明什么：** {what}")
        lines.append(f"- **怎么读：** {how}")
        if why:
            lines.append(f"- **为什么放在这里：** {why}")
        if exam:
            lines.append(f"- **复习/考试用法：** {exam}")
    elif key == "traditional_chinese":
        lines = [f"**源內圖表講解：{title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **圖表在說明什麼：** {what}")
        lines.append(f"- **怎麼讀：** {how}")
        if why:
            lines.append(f"- **為什麼放在這裡：** {why}")
        if exam:
            lines.append(f"- **複習/考試用法：** {exam}")
    else:
        lines = [f"**Source-figure reading note: {title}**", f"[[VISUAL:{marker_index}]]"]
        if what:
            lines.append(f"- **What the figure shows:** {what}")
        lines.append(f"- **How to read it:** {how}")
        if why:
            lines.append(f"- **Why it matters here:** {why}")
        if exam:
            lines.append(f"- **Exam / revision use:** {exam}")
    return "\n\n" + "\n".join(lines) + "\n\n"


def ensure_markdown_note_headings(summary: str, preferred_language: str) -> str:
    """Promote common note labels to markdown headings so navigation is stable."""
    if not summary:
        return summary
    heading_pattern = re.compile(
        r"^\s*(?:"
        r"Learning question|Source and argument map|Core notes|Key terms(?: and mechanisms)?|Core argument|Key ideas?|Concepts? explained|"
        r"Sources? \(|Sources?:|Source evidence(?:\s*/\s*example matrix)?|Reading the source evidence|Worked examples?|Evidence matrix|Comparison table|"
        r"Exam strategy|Common mistakes|Revision(?: checklist)?|Conclusion|"
        r"学习问题|来源与论点地图|來源與論點地圖|核心笔记|核心筆記|关键术语与机制|關鍵術語與機制|核心论点|关键概念|源内证据|源內證據|证据矩阵|例子与证据|概念比较表|"
        r"考试策略|考試策略|常见错误|常見錯誤|复习|復習|结论|結論"
        r")\b.*$",
        flags=re.I,
    )
    lines: List[str] = []
    heading_count = 0
    for raw_line in summary.splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if re.match(r"^#{1,4}\s+", stripped):
            heading_count += 1
            lines.append(line)
            continue
        if heading_pattern.match(stripped) and len(stripped) <= 140:
            heading_count += 1
            lines.append(f"## {stripped}")
        else:
            lines.append(line)

    text = "\n".join(lines).strip()
    if heading_count <= 1:
        key = normalise_language_key(preferred_language)
        heading = "## 核心笔记" if key in {"simplified_chinese", "mixed_chinese_english"} else "## Core Notes"
        first_heading = re.search(r"^#\s+.+$", text, flags=re.M)
        if first_heading:
            insert_at = first_heading.end()
            text = text[:insert_at] + "\n\n" + heading + text[insert_at:]
        else:
            text = heading + "\n\n" + text
    return text


def _v23_fallback_visual_cards(candidates: List[dict], labels: dict, preferred_language: str = "auto") -> List[dict]:
    """Guarantee source figures render when the vision filter is overly cautious."""
    cards: List[dict] = []
    for cand in candidates or []:
        if not _v23_candidate_has_source_teaching_value(cand):
            continue
        caption = clean_source_figure_caption(cand.get("caption") or "")
        kind = normalise_space(cand.get("visual_kind") or "")
        location = normalise_space(cand.get("location") or "")
        kind_title = kind.replace("/", " / ").title() if kind and kind != "unknown" else labels.get("figure_title", "Source figure")
        caption_title = truncate_text(re.sub(r"^(?:Render-mode|visual-score)\b.*?\.\s*", "", caption).strip(), 72)
        title = caption_title if len(caption_title) >= 8 else kind_title
        cards.append({
            "index": len(cards),
            "source_index": cand.get("source_index"),
            "source_title": cand.get("source_title", ""),
            "location": location,
            "caption": caption,
            "url": cand.get("url", ""),
            "title": title,
            "what_shows": caption,
            "argument_supported": "Use this source figure to read the source evidence directly, then connect the visible data, labels, or comparison back to the nearby concept in the notes.",
            "cross_source_connection": "",
            "how_to_read": _v23_default_how_to_read(kind, preferred_language),
            "exam_use": "Use the figure as source evidence: describe what is visible, interpret it, then state the limitation or implication.",
            "visual_kind": kind,
        })
        cards[-1] = _v23_enrich_visual_card_details(cards[-1], labels, preferred_language)
        if len(cards) >= CONTROLLED_MAX_VISUALS:
            break
    return cards


def _v23_marker_block(card: dict, marker_index: int, preferred_language: str) -> str:
    return _v23_source_figure_note_block(card, marker_index, preferred_language)


def _v23_ensure_visual_note_blocks(summary: str, cards: List[dict], preferred_language: str) -> str:
    """Replace bare visual markers with inline source-figure reading notes."""
    text = summary or ""
    for marker_index, card in enumerate(cards or []):
        marker = f"[[VISUAL:{marker_index}]]"
        if marker not in text:
            continue
        pos = text.find(marker)
        window_before = text[max(0, pos - 360):pos]
        if re.search(r"Source-figure reading note|源内图表讲解|源內圖表講解", window_before, flags=re.I):
            continue
        text = text.replace(marker, _v23_source_figure_note_block(card, marker_index, preferred_language).strip(), 1)
    return text


def remove_standalone_visual_diagram_headings(summary: str) -> str:
    """Remove old standalone visual-feature headings so figures stay fused into notes."""
    visual_heading_pattern = re.compile(
        r"^#{1,4}\s*(?:"
        r"visual\s*(?:/|and)?\s*diagram(?:-based)?(?:\s*explanation)?|"
        r"visual\s*evidence(?:\s*in\s*context)?|"
        r"source\s*figures(?:\s*in\s*context)?|"
        r"source\s*visuals|"
        r"diagram(?:-based)?\s*explanation|"
        r"图像证据|圖像證據|视觉证据|視覺證據|来源图表|來源圖表|图表说明|圖表說明"
        r")\b.*$",
        flags=re.I,
    )
    kept: List[str] = []
    for line in (summary or "").splitlines():
        if visual_heading_pattern.match(line.strip()):
            continue
        kept.append(line)
    text = "\n".join(kept)
    text = re.sub(r"\bVisual evidence in Context\b", "", text, flags=re.I)
    text = re.sub(r"\bVisual evidence\b", "Source example", text, flags=re.I)
    text = re.sub(r"图像证据|圖像證據", "来源例子", text)
    return re.sub(r"\n{4,}", "\n\n\n", text).strip()


def enforce_thetawave_inline_note_format(summary: str, cards: List[dict], preferred_language: str) -> str:
    summary = _v22_ensure_visual_markers(summary or "", cards or [], preferred_language)
    return remove_standalone_visual_diagram_headings(summary)


def _v22_ensure_visual_markers(summary: str, cards: List[dict], preferred_language: str) -> str:
    """v23 override: insert missing visuals near relevant text, not in an end gallery."""
    summary = summary or ""
    if not cards:
        return summary
    existing = {int(x) for x in re.findall(r"\[\[VISUAL:(\d+)\]\]", summary)}
    missing = [i for i in range(len(cards)) if i not in existing]
    if not missing:
        return summary

    blocks = re.split(r"(\n{2,})", summary.rstrip())
    paragraph_indices = [i for i in range(0, len(blocks), 2) if blocks[i].strip()]
    used_paragraphs = set()
    for marker_index in missing:
        card = cards[marker_index]
        keywords = _v23_keywords_for_card(card)
        location_terms = _v23_location_terms(card)
        best_i = None
        best_score = -1
        for i in paragraph_indices:
            if i in used_paragraphs or f"[[VISUAL:{marker_index}]]" in blocks[i]:
                continue
            text = blocks[i].lower()
            if text.startswith("#"):
                continue
            score = sum(1 for keyword in keywords if keyword and keyword in text)
            score += 4 * sum(1 for term in location_terms if term and term.lower() in text)
            if "visual" in text or "图" in text or "表" in text:
                score += 1
            if re.search(r"\b(ultimatum|dictator|bowles|gintis|correlation|maoa|genotype|heritability|chimp|公平|最后通牒|独裁者|相关|基因|遗传)\b", text, flags=re.I):
                score += 2
            if score > best_score:
                best_score = score
                best_i = i
        if best_i is None or best_score <= 0:
            # Prefer the visual-argument section if the model created one.
            for i in paragraph_indices:
                if re.search(r"Source Figures|来源图表|图像|圖像|Diagram|图表|圖表|Data|数据", blocks[i], flags=re.I):
                    best_i = i
                    break
        if best_i is None:
            best_i = paragraph_indices[min(marker_index, len(paragraph_indices) - 1)] if paragraph_indices else 0
        blocks[best_i] = _v23_remove_visible_slide_refs(blocks[best_i]).rstrip() + _v23_marker_block(card, marker_index, preferred_language)
        used_paragraphs.add(best_i)
    return "".join(blocks).strip()


def expand_sparse_inline_summary(
    summary: str,
    source_context: str,
    visual_context: str,
    preferred_language: str,
    min_units: int,
    force: bool = False,
    quality_gaps: Optional[List[str]] = None,
    prompt_mode: str = DEFAULT_NOTE_PROMPT_MODE,
) -> str:
    """Expand notes only when the first pass became too thin after adding visuals."""
    if not note_prompt_mode_allows_expansion(prompt_mode):
        return summary
    if not summary or (not force and count_readable_units(summary) >= min_units):
        return summary
    language_rule = language_instruction_for(preferred_language)
    prompt_mode_key = normalise_note_prompt_mode(prompt_mode)
    prompt_mode_label = note_prompt_mode_label(prompt_mode_key)
    prompt_mode_text = load_note_prompt_mode_text(prompt_mode_key)
    prompt = f"""
You are Synapse, improving a source-grounded study-note page.

Language requirement: {language_rule}
Never translate the product name Synapse.

Selected prompt mode: {prompt_mode_label} ({prompt_mode_key})
Mode-specific prompt file:
{prompt_mode_text}

Mode priority rule:
- Preserve the selected prompt mode's intended length, tone, section shape, and evidence discipline.
- If a generic expansion rule conflicts with the selected prompt mode, follow the selected prompt mode.

Problem:
The current notes may be too thin, too image-dependent, too generic, or missing professional source-grounded explanation.
Detected quality gaps: {", ".join(quality_gaps or []) if quality_gaps else "not enough advanced tutor detail"}

Your task:
- Expand the notes into a professional, detailed tutor-style study guide while keeping the same clean notes-page feel.
- Preserve every existing [[VISUAL:n]] marker exactly. Do not delete, rename, renumber, or move markers far away from the concept they explain.
- If the available visual card context lists Source figure n and the current notes forgot it, insert [[VISUAL:n]] exactly once after the concept, example, table, or evidence paragraph it supports. Do not invent markers beyond the listed figures.
- Put each [[VISUAL:n]] marker on its own line between paragraphs. Never write "After [[VISUAL:n]]:" or put the marker inside a sentence.
- Do not repeat the same visual marker. If the same source figure matters again later, refer to it in prose, for example "as shown in Source figure 2", instead of inserting the image marker again.
- Do not create a separate visual gallery or "Visual evidence" section.
- Do not merely restate the visual card caption. Add real teaching text: definitions, reasoning, worked examples, comparisons, source evidence, exam use, and common mistakes.
- Keep images as supporting evidence. The prose must still be understandable if the image card is temporarily unavailable.
- High quality means more source-specific teaching, not more clutter: keep headings readable, but restore depth, examples, mechanism, evidence, and revision value.
- Add enough detail for a student to revise from the page: concept -> source evidence -> interpretation -> why it matters -> exam/application.
- Make the writing feel like expert lecture notes: precise terminology, clear mechanism, source-specific examples, assumptions, caveats, and practical use.
- Use markdown tables where a comparison or evidence summary would make the explanation clearer.
- Keep mathematical notation renderable: write inline formulas with \\( ... \\), display equations with \\[ ... \\], and matrices with bmatrix/pmatrix environments rather than raw nested arrays.
- Upgrade short bullet lists into proper teaching notes: explain mechanisms, causal logic, assumptions, limitations, and what students usually confuse.
- For each major concept, include a source-grounded example or data point when the source provides one.
- Add at least one comparison/evidence table and one revision/exam-use table when the source supports it.
- Add professional connective tissue between sections: explain how each concept leads to the next and how evidence changes the interpretation.
- Include worked examples, calculations, method/result explanations, or case analysis whenever the source provides material for them.
- For figures and tables, include a specific reading method: what to look at first, what pattern or relationship matters, what conclusion is justified, and what cannot be concluded.
- Avoid shallow one-line entries such as "Definition / Why / Exam use" without explanation.
- Do not print the note-production template itself. Use readable concept headings and natural teaching paragraphs instead of repeated checklist blocks.
- If the current notes contain a heading like "Core Notes (concept title -> short definition -> ...)", replace it with "Core Notes" and rewrite the section into polished study notes.
- Use numbered lists only for ordered steps, not as a default way to introduce concepts. Use headings for major concepts and paragraphs for label-style explanations.

Source context:
{truncate_text(source_context, 45000)}

Available visual card context:
{visual_context if visual_context else 'No visual card metadata.'}

Current notes to expand:
{summary}

Return the expanded final markdown only.
"""
    try:
        expanded = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        original_units = count_readable_units(summary)
        expanded_units = count_readable_units(expanded)
        original_markers = set(re.findall(r"\[\[VISUAL:\d+\]\]", summary))
        expanded_markers = set(re.findall(r"\[\[VISUAL:\d+\]\]", expanded))
        minimum_units = max(int(min_units * 0.85), int(original_units * 0.9)) if force else max(original_units + 500, int(min_units * 0.85))
        if (
            expanded
            and not is_refusal_or_useless_response(expanded)
            and expanded_units >= minimum_units
            and original_markers.issubset(expanded_markers)
        ):
            return expanded
    except Exception:
        pass
    return summary


def generate_reference_style_multisource_notes(source_units: List[dict], preferred_language: str, depth_plan: dict, prompt_mode: str = DEFAULT_NOTE_PROMPT_MODE) -> str:
    """v23: controlled notes with relevant in-text diagrams/tables/charts only."""
    source_context = _v22_source_context(source_units)
    generation_language = resolve_generation_language_key(preferred_language, source_context)
    language_rule = language_instruction_for_generation(preferred_language, source_context)
    recommended_structure = note_structure_for_language(generation_language, source_context)
    prompt_mode_key = normalise_note_prompt_mode(prompt_mode)
    prompt_mode_label = note_prompt_mode_label(prompt_mode_key)
    prompt_mode_text = load_note_prompt_mode_text(prompt_mode_key)
    mode_min_units = note_prompt_mode_min_units(prompt_mode_key, env_int("CONTROLLED_MIN_OUTPUT_UNITS", 2600))
    visual_cards = generate_visual_argument_cards(source_units, source_context, generation_language)
    visual_context = _v22_visual_context_for_prompt(visual_cards)
    source_list = "\n".join(
        f"Source {i}: {u.get('title_candidate') or u.get('display_name')}"
        for i, u in enumerate(source_units or [], start=1)
    )
    prompt = f"""
You are Synapse, an advanced study tutor and source-grounded lecturer.

Language requirement: {language_rule}
Never translate the product name Synapse.

Selected prompt mode: {prompt_mode_label} ({prompt_mode_key})
Mode-specific prompt file:
{prompt_mode_text}

Mode priority rule:
- The selected prompt mode is the controlling instruction for output length, structure, tone, and evidence discipline.
- If the default Synapse note style asks for more depth, more tables, or more expansion than the selected prompt mode wants, follow the selected prompt mode.
- Always keep source identity, language, math rendering, and visual-marker rules intact.

Mission:
Create the notes requested by the selected prompt mode. The page should feel like Synapse has read the uploaded source, identified the real learning problem, and then used the selected mode to present the right amount of explanation.
The target is a useful study output: a student should be able to answer the immediate learning need, interpret source figures, explain the reasoning chain, and use source evidence without losing source accuracy.
High quality means source-specific usefulness with clean editorial structure. Match the selected mode's depth: concise for Quick Answer, guided for Tutor Mode, formal for Assignment / APA Mode, evidence-disciplined for Source-Strict Research Mode, and comprehensive for Professor Mode.

Style:
- write like real professional class notes: each concept should have a short meaningful heading, a precise explanation in your own words, and source-grounded examples or caveats where useful;
- clear lecture-note page, with short headings, compact paragraphs, bullets only where they help, and tables for comparison/evidence;
- explain every major idea in detail without exposing the template: define the idea, explain the mechanism or logic, connect source evidence/example, identify an assumption or limitation, then add a mistake or exam use when useful;
- do not only list facts. Show the reasoning chain, causal structure, and relationships between ideas;
- do not jump straight to overview tables. Teach the ideas first, then use tables to consolidate them;
- do not overuse slide/page numbers. Teach the concept directly.
- never let source screenshots replace teaching. The text must explain the idea before and after the image.
- when the source contains a graph, table, experiment setup, diagram, or data display, explicitly teach how to read it: variables/labels -> pattern/result -> interpretation -> limitation -> exam use.
- use discipline-aware explanation: for economics, include assumptions, curve shifts, formulas, worked calculations, and common graph-label mistakes; for psychology, use research question -> method -> result -> interpretation -> limitation; for law/policy, use rule -> element/test -> consequence -> application; for mathematics, use definitions -> theorem/condition -> worked method -> verification.

Source-image rules:
- Use images for diagrams, data tables, charts, scatter plots, correlation figures, genotype/environment graphs, experiment setups, game-theory examples, method/result figures, or formulas.
- Reject decorative cover photos, portraits, logos, stock photos, lecturer/contact slides, and random pictures.
- If selected source figures exist, use them as source-reading moments inside the notes. Insert [[VISUAL:n]] where the figure materially helps the explanation, even if the source figure is a full slide/page screenshot.
- Use every selected source figure exactly once unless the figure is genuinely impossible to connect. These selected figures have already passed the source-evidence filter.
- Around every [[VISUAL:n]], write an inline source-figure explanation: what question the figure answers, how to read the figure/table/graph, what evidence it gives, and what a student should remember.
- Put each visual marker on its own line, exactly like [[VISUAL:0]]. Never write "Visual 2", "After [[VISUAL:2]]", "Before [[VISUAL:2]]", or put a visual marker inside a sentence.
- Never insert the same [[VISUAL:n]] marker more than once. Later references should name the figure in prose, such as "see Source figure 2 above".
- The page/slide number is internal provenance only. Do not put it in headings.

Sources:
{source_list}

Balanced extracted source context:
{source_context}

Relevant in-text source figures selected from the uploaded files:
{visual_context if visual_context else 'No relevant source figures were selected. Do not invent image markers.'}

Output requirements:
- Return final markdown only.
- Write in the selected language.
- Keep all mathematical notation MathJax-compatible: inline formulas as \\( ... \\), display equations as \\[ ... \\], and matrices as \\begin{{bmatrix}} ... & ... \\\\ ... \\end{{bmatrix}}; do not output raw matrix arrays like [[1,2],[3,4]].
- Never print internal structure instructions such as "concept title -> short definition -> explanation -> source example -> implication -> limitation/misunderstanding -> exam use".
- Do not restart every concept as "1.". Use markdown headings like "### Gradient" for major concepts, then readable paragraphs or a few bullets.
- Do not repeat the same Definition / Explanation / Source example / Implication / Limitation / Exam use checklist for every concept. Use natural prose, and reserve bold labels for genuinely helpful callouts.
- Use numbered lists only for true ordered steps. Use normal paragraphs or short bullets for concept explanations; do not start every concept with "1.".
- Do not write label bullets like "- Definition:" or "- Why it matters:" repeatedly. Prefer "**Definition:** ..." as a paragraph when the label is genuinely useful.
- Keep headings short and specific; avoid long headings that contain the whole note structure.
- Use the same "notes page" feel as the reference image: clean headings, strong paragraphs, helpful tables, and source screenshots embedded only when useful.
- This is the Notes tab, not only the Summary section. It should be detailed enough to study from directly.
- Build the page as deep professional notes, not a short executive summary: include mechanisms, examples, evidence, caveats, exam framing, and memory hooks where supported.
- For dense academic/technical sources, prefer richer subsections over compression. It is acceptable for the notes to be long if the extra detail is source-grounded and useful.
- Do not shrink the summary because images are present. Images should add evidence; they must not replace definitions, reasoning, examples, or source interpretation.
- Insert [[VISUAL:n]] immediately after the concept/example/data point it explains. Use each available source figure at most once.
- When selected source figures exist, at least one must appear in the body near the relevant explanation; never produce a text-only page while source figures are available.
- Before each [[VISUAL:n]], write enough concept text for the student to know what problem/question the image answers.
- After each [[VISUAL:n]], continue the explanation naturally with what the source figure teaches. Do not leave a bare image without explanation.
- The visual marker must be a standalone markdown line between paragraphs. The sentence before it should prepare the reader; the sentence after it should explain what the figure means.
- If a later paragraph needs the same visual again, write "as shown in Source figure n" instead of repeating the marker or displaying the image again.
- Do not use page/slide numbers as the visible teaching device.
- Include at least two markdown tables when supported by the source:
  1. a concept comparison table;
  2. a source evidence / example table with columns like concept, source evidence, interpretation, limitation, exam use.
- Mention every usable source at least once.
- Do not include "Visual evidence", "图像证据", "Source Figures", or a standalone image section title.
- Target richer content than a quick summary: include the core claim, key terms, source evidence, worked examples, limitations/misunderstandings, and exam/application use when the source supports them.
- Avoid generic filler such as "this is important". Every point must say what the student should understand or do.
- For every major idea, teach it in depth: define the concept, explain the mechanism or reasoning chain, show the source example/data, state what the evidence can and cannot prove, then give exam/revision use.
- For every major graph/table/diagram, teach the reading protocol and the interpretation: labels/variables -> relationship/pattern -> conclusion -> limitation -> exam sentence.
- Use every selected Source figure exactly once as an in-text learning moment. If a selected figure is a lecture slide screenshot, place it where the slide's concept is being taught.
- Do not compress a complex lecture into a list of one-line bullets. Use short paragraphs under bullets when needed.
- If the source contains named studies, theorists, experiments, cases, graphs, or tables, explain what each one contributes to the argument rather than merely naming it.
- Build table(s) from source material when it helps: theory comparison, evidence matrix, key term table, case/example table, or exam-use table.
- Include "common student mistake" notes for concepts that are easy to confuse.
- End with a practical revision checklist that tells the student what they should be able to explain, compare, calculate, or critique.
- Add a "how to use this source evidence" moment for major experiments, figures, tables, or named studies so students learn how to write about them, not just recognise them.
- If the uploaded material has multiple related ideas, preserve the teaching progression instead of flattening everything into one table.

Recommended structure:
{recommended_structure}

Quality bar:
- A student should be able to answer "what is the point?", "what evidence supports it?", "what can be confused?", and "how do I use this in an exam?" after reading the page.
- If the source contains a table/data/example like animal language, Piaget tasks, correlations, genetics, methods, or case studies, reconstruct it as a markdown table even if no image is used.
- Prefer source-grounded explanation over broad general textbook filler.
"""
    try:
        result = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        if not result or is_refusal_or_useless_response(result):
            raise RuntimeError("Relevant visual notes were too short or unusable.")
        if count_readable_units(result) < mode_min_units:
            raise RuntimeError("Relevant visual notes were too short or unusable.")
        source_has_table_or_data = bool(re.search(
            r"\b(table|figure|fig\.|graph|chart|plot|correlation|experiment|study|results?|data|mean|median|percentage|rate|comparison)\b|图|表|数据|实验|结果|对比",
            source_context,
            flags=re.I,
        ))
        table_count = markdown_table_count(result)
        quality_gaps = advanced_notes_quality_flags(result, source_context)
        missing_visual_markers = bool(visual_cards) and not re.search(r"\[\[VISUAL:\d+\]\]", result or "")
        if missing_visual_markers:
            quality_gaps.append("selected in-text source figures were not used in the notes")
        should_expand = (
            os.getenv("ENABLE_CONDITIONAL_NOTE_EXPANSION", "true").lower() not in {"0", "false", "no"}
            and note_prompt_mode_allows_expansion(prompt_mode_key)
            and (
                bool(quality_gaps)
                or (source_has_table_or_data and table_count < ADVANCED_NOTES_MIN_TABLES)
            )
        )
        if should_expand:
            result = expand_sparse_inline_summary(
                result,
                source_context,
                visual_context,
                generation_language,
                RICH_INLINE_MIN_OUTPUT_UNITS,
                force=bool(quality_gaps) or missing_visual_markers or (source_has_table_or_data and table_count < ADVANCED_NOTES_MIN_TABLES),
                quality_gaps=quality_gaps,
                prompt_mode=prompt_mode_key,
            )
    except Exception:
        is_chinese_fallback = generation_language in {"simplified_chinese", "traditional_chinese", "mixed_chinese_english"}
        rows = []
        for i, unit in enumerate(source_units or [], start=1):
            title = unit.get("title_candidate") or unit.get("display_name") or f"Source {i}"
            excerpt = truncate_text(normalise_space(unit.get("text_excerpt") or ""), 850)
            fallback_excerpt = "可读文本有限；请结合已提取的源内图表、表格或实验截图阅读。" if is_chinese_fallback else "Readable text was limited; use the extracted source figures, tables, or experiment screenshots as evidence."
            rows.append(f"| Source {i} | {title} | {excerpt or fallback_excerpt} |")
        if is_chinese_fallback:
            result = (
                "# 综合学习笔记\n\n"
                "## 核心框架\n\nSynapse 已提取可读来源内容，并会把真正有教学价值的源内图表、表格、实验流程或数据截图放进相关概念旁边。阅读时先理解概念，再用来源证据检验这个概念。\n\n"
                "## 来源证据表\n\n| 来源 | 主题 | 可用证据 |\n|---|---|---|\n" + "\n".join(rows) + "\n\n"
                "## 源内例子与证据\n\n"
            )
        else:
            result = (
                "# Integrated Study Guide\n\n"
                "## Big Picture\n\nSynapse extracted the readable source content and will place useful uploaded figures, tables, experiment setups, or data screenshots beside the concepts they explain. Read the concept first, then use the source evidence to test and sharpen it.\n\n"
                "## Source Evidence Table\n\n| Source | Topic | Useful evidence |\n|---|---|---|\n" + "\n".join(rows) + "\n\n"
                "## Source Examples and Evidence\n\n"
            )
        for i, card in enumerate(visual_cards or []):
            title = card.get("title") or ("来源图表" if is_chinese_fallback else "Source figure")
            what = card.get("what_shows") or card.get("caption") or ""
            why = card.get("argument_supported") or card.get("why_relevant") or ""
            lead = (
                f"这个来源图表值得放在正文中，因为它展示了：{normalise_space(what)}。它支持或限定的论点是：{normalise_space(why)}。"
                if is_chinese_fallback else
                f"This source figure belongs in the notes because it shows: {normalise_space(what)}. The claim it supports or limits is: {normalise_space(why)}."
            )
            result += (
                f"### {title}\n\n"
                f"{lead}"
                f"{_v23_marker_block(card, i, generation_language)}"
            )
    result = remove_auto_bilingual_heading_leakage(result, preferred_language, source_context)
    result = polish_note_readability_markdown(result, generation_language)
    result = ensure_markdown_note_headings(result, generation_language)
    final_result = _v22_ensure_visual_markers(result, visual_cards, generation_language)
    final_result = _v23_ensure_visual_note_blocks(final_result, visual_cards, generation_language)
    final_result = polish_note_readability_markdown(final_result, generation_language)
    return remove_standalone_visual_diagram_headings(final_result)


def attach_visual_argument_section(summary: str, source_units: List[dict], preferred_language: str) -> str:
    """v36: keep uploaded source screenshots fused into normal note text."""
    cards = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if not cards:
        cards = generate_visual_argument_cards(source_units, summary[:env_int("VISUAL_ARGUMENT_CONTEXT_CHARS", 35000)], preferred_language)
    return enforce_thetawave_inline_note_format(summary or "", cards, preferred_language)


def finalize_generated_summary(
    summary: str,
    requested_language: str,
    generation_language: str,
    source_context: str = "",
    source_units: Optional[List[dict]] = None,
    attach_visuals: bool = True,
    protect_heading: bool = False,
) -> str:
    """Single post-processing path for notes returned from generation or cache."""
    text = summary or ""
    text = remove_auto_bilingual_heading_leakage(text, requested_language, source_context)
    if protect_heading:
        text = protect_synapse_brand_and_first_heading(text, generation_language)
    text = normalise_plain_sqrt_text(text)
    text = polish_note_readability_markdown(text, generation_language)
    if attach_visuals and source_units is not None:
        text = attach_visual_argument_section(text, source_units, generation_language)
    text = dedupe_visual_markers(text)
    text = remove_auto_bilingual_heading_leakage(text, requested_language, source_context)
    text = polish_note_readability_markdown(text, generation_language)
    return text


@app.get("/health/v23")
def health_v23():
    return {
        "status": "ok",
        "mode": "relevant_in_text_teaching_images",
        "html_css_changed": False,
        "relevant_visual_mode": RELEVANT_VISUAL_MODE,
        "candidate_pool_limit": RELEVANT_VISUAL_POOL_LIMIT,
        "pdf_visual_candidate_limit": PDF_VISUAL_CANDIDATE_LIMIT,
        "rich_inline_min_output_units": RICH_INLINE_MIN_OUTPUT_UNITS,
        "min_score": RELEVANT_VISUAL_MIN_SCORE,
        "max_in_text_visuals": CONTROLLED_MAX_VISUALS,
        "rejects_decorative_visuals": True,
        "prioritises": ["data tables", "charts/graphs", "diagrams", "experiment/event sequences", "formulas/process models"],
    }


def _v23_card_text(card: dict) -> str:
    return normalise_space(" ".join(
        str(card.get(key, ""))
        for key in (
            "title",
            "caption",
            "what_shows",
            "argument_supported",
            "cross_source_connection",
            "how_to_read",
            "exam_use",
            "location",
            "visual_kind",
        )
    ))


def _v23_card_is_teaching_figure(card: dict) -> bool:
    if not isinstance(card, dict) or not card.get("url"):
        return False
    if card.get("is_likely_decorative") or card.get("visual_kind") == "unknown":
        return False
    text = _v23_card_text(card)
    if re.search(r"\b(stock|dreamstime|getty|unsplash|product photo|phone photo|generic photo|decorative photo)\b", text, flags=re.I):
        return False
    kind = card.get("visual_kind")
    if kind in {"data/table", "graph/chart", "diagram/model", "experiment/event", "formula/calculation", "method/result figure"}:
        return True
    signals = _v23_signal_counts(text)
    return signals["teaching"] > 0 and signals["decorative"] <= signals["teaching"]


def _v23_selected_card_can_render(card: dict) -> bool:
    """Keep the browser gallery aligned with the already-inserted marker cards."""
    if not isinstance(card, dict) or not card.get("url"):
        return False
    text = _v23_card_text(card)
    if re.search(r"\b(stock|dreamstime|getty|unsplash|product photo|phone photo|generic photo|decorative photo)\b", text, flags=re.I):
        return False
    if _v23_card_is_teaching_figure(card):
        return True
    signals = _v23_signal_counts(text)
    if card.get("is_likely_decorative") and signals["decorative"] > signals["teaching"]:
        return False
    return signals["teaching"] > 0 and signals["decorative"] <= signals["teaching"] + 1


def build_visual_gallery(source_units: List[dict]) -> List[dict]:
    """v23 final override: return only in-text source figures, never a raw gallery."""
    cards: List[dict] = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if not cards:
        cards = generate_visual_argument_cards(source_units, _v22_source_context(source_units), "auto")

    cleaned: List[dict] = []
    max_items = max(0, min(CONTROLLED_MAX_VISUALS, MULTISOURCE_VISUAL_GALLERY_LIMIT, MAX_MULTI_SOURCE_VISUAL_IMAGES))
    for marker_index, card in enumerate(cards or []):
        if not _v23_selected_card_can_render(card):
            continue
        card_language = "simplified_chinese" if re.search(r"[\u4e00-\u9fff]", _v23_card_text(card)) else "english"
        item = _v23_enrich_visual_card_details(dict(card), source_figure_labels(card_language), card_language)
        item["index"] = marker_index
        item["title"] = normalise_space(item.get("title") or f"Source figure {marker_index + 1}")
        item["caption"] = clean_source_figure_caption(item.get("caption") or item.get("what_shows") or "")
        item["what_shows"] = clean_source_figure_caption(item.get("what_shows") or item.get("caption") or "")
        for detail_key in ("why_relevant", "argument_supported", "cross_source_connection", "how_to_read", "exam_use"):
            item[detail_key] = clean_source_figure_caption(item.get(detail_key) or "")
        cleaned.append(item)
        if len(cleaned) >= max_items:
            break
    return cleaned


def rebuild_cached_visual_argument_cards(source_units: List[dict], preferred_language: str) -> List[dict]:
    """Recreate browser-renderable source cards on cache hits without model calls."""
    cards: List[dict] = []
    for unit in source_units or []:
        cards.extend(unit.get("visual_argument_cards") or [])
    if cards:
        labels = source_figure_labels(preferred_language)
        return [
            _v23_enrich_visual_card_details(card, labels, preferred_language)
            for card in cards
            if isinstance(card, dict)
        ]

    hard_limit = max(1, min(CONTROLLED_MAX_VISUALS, VISUAL_ARGUMENT_CARD_LIMIT, MAX_MULTI_SOURCE_VISUAL_IMAGES))
    candidate_pool = select_visual_candidates_for_argument(source_units, hard_limit)
    if not candidate_pool:
        return []

    labels = source_figure_labels(preferred_language)
    cards = _v23_fallback_visual_cards(candidate_pool, labels, preferred_language)
    if source_units:
        source_units[0]["visual_argument_cards"] = cards
    return cards


@app.post("/translate-notes")
async def translate_notes(payload: Dict):
    """Translate an already generated notes page without losing source markers.

    The frontend renders [[VISUAL:n]] markers as in-text source cards, so this
    endpoint treats those markers as protected tokens and returns sections for
    navigation after translation.
    """
    try:
        require_openai()
        if not isinstance(payload, dict):
            return {"error": "Invalid translation request."}

        summary = str(payload.get("summary") or "").strip()
        if not summary:
            return {"error": "No notes were provided for translation."}

        target_language = payload.get("target_language") or "english"
        language_key = normalise_language_key(target_language)
        if language_key == "auto":
            language_key = resolve_generation_language_key("auto", summary)
        language_rule = language_instruction_for(language_key)
        title = normalise_space(str(payload.get("title") or "Study Notes"))
        original_markers = re.findall(r"\[\[VISUAL:\d+\]\]", summary)

        prompt = f"""
You are translating a Synapse study-note page for a student.

Language requirement: {language_rule}
Never translate the product name Synapse.

Critical preservation rules:
- Preserve the markdown structure: headings, bullets, numbered lists, tables, bold text, formulas, and paragraph order.
- Preserve every in-text source marker exactly, for example [[VISUAL:0]]. Do not translate, delete, renumber, or move these markers away from the nearby concept.
- Do not summarise or shorten the notes. Translate the existing detail faithfully.
- Keep source names, researcher names, article titles, file names, formulas, data values, and academic terms accurate. If a key term is better left in English, keep it and explain around it in the target language.
- Do not add new factual claims.

Return strict JSON:
{{
  "title": "translated title",
  "summary": "translated markdown notes"
}}

Title:
{title}

Notes:
{summary}
"""
        raw = generate_chat(
            [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
            model=model_for_depth("detailed"),
            temperature=0,
            max_tokens=CONTROLLED_OUTPUT_TOKENS,
        ).strip()
        parsed = extract_json_object(raw)
        translated = str(parsed.get("summary") or raw or "").strip()
        translated_title = normalise_space(str(parsed.get("title") or title))

        if translated.startswith("```"):
            translated = re.sub(r"^```(?:json|markdown)?\s*|\s*```$", "", translated, flags=re.I | re.S).strip()
        if is_refusal_or_useless_response(translated):
            return {"error": "Translation response was not usable."}

        missing_markers = [marker for marker in original_markers if marker not in translated]
        if missing_markers:
            translated = f"{translated.rstrip()}\n\n" + "\n\n".join(missing_markers)

        translated = protect_synapse_brand_and_first_heading(translated, language_key)
        translated = polish_note_readability_markdown(translated, language_key)
        translated = ensure_markdown_note_headings(translated, language_key)
        translated = normalise_plain_sqrt_text(translated)
        sections = parse_sections(translated)
        translated_title = localise_title_if_needed(translated_title, language_key)

        return {
            "title": translated_title,
            "summary": translated,
            "sections": sections,
            "output_language": language_key,
        }
    except Exception as error:
        return {"error": str(error)}


# -----------------------------------------------------------------------------
# Quiz generation
# -----------------------------------------------------------------------------

QUIZ_TYPE_LABELS = {
    "single_choice": "Single choice",
    "multiple_choice": "Multiple choice",
    "true_false": "True / False",
    "worked_problem": "Worked problem",
    "error_diagnosis": "Error diagnosis",
    "short_answer": "Short answer",
    "case_analysis": "Case analysis",
    "essay": "Essay",
}

DEFAULT_QUIZ_TYPE_PLAN = [
    {"type": "worked_problem", "count": 2},
    {"type": "error_diagnosis", "count": 1},
    {"type": "case_analysis", "count": 1},
    {"type": "short_answer", "count": 1},
    {"type": "single_choice", "count": 1},
]

QUIZ_TYPE_ALIASES = {
    "single": "single_choice",
    "single_choice": "single_choice",
    "choice": "single_choice",
    "mcq": "single_choice",
    "单选题": "single_choice",
    "单选": "single_choice",
    "multiple": "multiple_choice",
    "multiple_choice": "multiple_choice",
    "多选题": "multiple_choice",
    "多选": "multiple_choice",
    "true_false": "true_false",
    "truefalse": "true_false",
    "tf": "true_false",
    "判断题": "true_false",
    "判断": "true_false",
    "worked": "worked_problem",
    "worked_problem": "worked_problem",
    "calculation": "worked_problem",
    "problem": "worked_problem",
    "proof": "worked_problem",
    "计算题": "worked_problem",
    "解答题": "worked_problem",
    "证明题": "worked_problem",
    "error": "error_diagnosis",
    "error_diagnosis": "error_diagnosis",
    "mistake": "error_diagnosis",
    "diagnosis": "error_diagnosis",
    "错题诊断": "error_diagnosis",
    "纠错题": "error_diagnosis",
    "short": "short_answer",
    "short_answer": "short_answer",
    "简答题": "short_answer",
    "简答": "short_answer",
    "case": "case_analysis",
    "case_analysis": "case_analysis",
    "案例分析题": "case_analysis",
    "案例分析": "case_analysis",
    "essay": "essay",
    "论述题": "essay",
    "论述": "essay",
}

QUIZ_LANGUAGE_ALIASES = {
    "multi": "multi_language",
    "multilingual": "multi_language",
    "multi_language": "multi_language",
    "multi-language": "multi_language",
    "multiple_languages": "multi_language",
    "多语言": "multi_language",
    "多語言": "multi_language",
}


def normalise_quiz_language(value: str) -> str:
    raw = str(value or "english").strip()
    key = raw.lower().replace("-", "_").replace(" ", "_")
    if key in QUIZ_LANGUAGE_ALIASES:
        return QUIZ_LANGUAGE_ALIASES[key]
    language_key = normalise_language_key(key)
    return language_key if language_key != "auto" else "english"


def quiz_language_instruction(preferred_language: str) -> str:
    key = normalise_quiz_language(preferred_language)
    if key == "multi_language":
        return (
            "Use the same dominant language as the generated notes. If the notes mix languages, "
            "write clear bilingual-friendly quiz content and preserve important source academic terms "
            "in their original language when useful."
        )
    return language_instruction_for(key)


def normalise_quiz_type(value: str) -> str:
    key = normalise_space(str(value or "")).lower().replace("-", "_").replace(" ", "_")
    return QUIZ_TYPE_ALIASES.get(key) or QUIZ_TYPE_ALIASES.get(str(value or "").strip()) or "single_choice"


def clamp_quiz_count(value, default: int = 1) -> int:
    try:
        number = int(value)
    except Exception:
        number = default
    return max(1, min(number, env_int("QUIZ_MAX_QUESTIONS", 30)))
