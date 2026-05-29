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


VISUAL_IMAGE_GUIDE_STYLE_VERSION = "grid-infographic-v5"


def visual_image_guide_domain_guidance(title: str, context: str) -> str:
    haystack = f"{title}\n{context}".lower()
    if re.search(r"machine learning|deep learning|artificial intelligence|\bai\b|neural|training data|classification|regression|supervised|unsupervised", haystack):
        return "\n".join([
            "- Machine learning domain: use a Data -> Features -> Training -> Model -> Prediction -> Evaluation flow as the main visual spine.",
            "- Use domain visuals such as datasets, feature columns, model blocks, neural-network nodes, decision boundary plots, confusion/evaluation mini charts, and bias/ethics warning callouts.",
            "- In the middle mechanism, use only large labels such as Data, Features, Training, Model, Prediction, Evaluation. Do not write small words on data cards, faces, documents, gauges, or mini charts.",
            "- Do not include formulas, graphs, or examples from unrelated subjects."
        ])
    if re.search(r"probability|conditional|union|intersection|venn|sample space|bayes|independent", haystack):
        return "\n".join([
            "- Probability domain: use Venn diagrams, sample-space rectangles, event tiles, conditional-probability arrows, and compact formula cards.",
            "- Keep symbols exact: union A ∪ B, intersection A ∩ B, conditional P(A | B), and independence P(A ∩ B) = P(A)P(B).",
            "- Do not turn the vertical conditional bar into a divider between unrelated words."
        ])
    if re.search(r"\bmoney market\b|fisher effect|loanable funds|quantity theory|central bank|inflation|reserve ratio|money multiplier|mv\s*=", haystack):
        return "\n".join([
            "- Economics domain: use money-market curves, reserve/banking flows, central-bank policy arrows, quantity-theory tiles, Fisher-effect rate arrows, and loanable-funds contrasts only when supported by the notes.",
            "- Keep graph labels precise: Ms is money supply, Md is money demand, S is saving/supply of loanable funds, and D is investment/demand.",
            "- Use worked calculation cards for reserve-ratio, velocity, inflation, or interest-rate examples when present."
        ])
    return "\n".join([
        "- Use subject-specific diagrams and icons from the uploaded source; do not borrow examples from unrelated subjects.",
        "- Represent detail visually with panels, icons, arrows, comparisons, timelines, small charts, and callouts rather than dense prose.",
        "- Include formulas only if they are central to the uploaded notes."
    ])


def visual_image_fallback_panel_titles(title: str, context: str) -> List[str]:
    headings = [
        clean_visual_guide_text(match.group(1))
        for match in re.finditer(r"^#{1,4}\s+(.+)$", context or "", flags=re.M)
    ]
    headings = [
        truncate_text(item, 42)
        for item in headings
        if item and not is_visual_guide_heading_only(item)
    ]
    if len(headings) >= 6:
        return headings[:10]
    if re.search(r"machine learning|deep learning|artificial intelligence|\bai\b|training data|classification", f"{title}\n{context}", flags=re.I):
        return ["Definition", "AI Relationship", "Traditional vs ML", "Data", "Features", "Training", "Model", "Prediction", "Evaluation", "Ethics"]
    if re.search(r"probability|conditional|union|intersection|venn|sample space", f"{title}\n{context}", flags=re.I):
        return ["Sample Space", "Union", "Intersection", "Conditional", "Independence", "Worked Example", "Common Mistakes", "Formula Check"]
    if re.search(r"\bmoney market\b|fisher effect|loanable funds|quantity theory|inflation|money multiplier", f"{title}\n{context}", flags=re.I):
        return ["Money Functions", "Money Market", "Banking Multiplier", "MV = PY", "Fisher Effect", "Loanable Funds", "Policy Tools", "Worked Example"]
    return (headings + ["Core Idea", "Process", "Evidence", "Example", "Comparison", "Revision"])[:10]


def visual_image_middle_focus(title: str, context: str) -> str:
    haystack = f"{title}\n{context}"
    if re.search(r"machine learning|deep learning|artificial intelligence|\bai\b|training data|classification|regression|supervised|unsupervised", haystack, flags=re.I):
        return (
            "Fill the central area with a mostly wordless model-learning mechanism: data table icons -> feature extraction symbols -> training loop arrows -> learned model -> prediction icons. "
            "Only the six large labels Data, Features, Training, Model, Prediction, Evaluation may appear in this central mechanism; all other details should be icons, charts, arrows, or numbered badges."
        )
    if re.search(r"probability|conditional|union|intersection|venn|sample space", haystack, flags=re.I):
        return (
            "Fill the central area with a large sample-space rectangle containing overlapping A and B regions, then connect union, intersection, "
            "and conditional probability callouts around it."
        )
    if re.search(r"\bmoney market\b|fisher effect|loanable funds|quantity theory|inflation|money multiplier", haystack, flags=re.I):
        return (
            "Fill the central area with a compact economics mechanism map: money market -> nominal rate -> Fisher equation -> loanable funds contrast, "
            "with one worked calculation tile."
        )
    return "Fill the central area with the main mechanism diagram, surrounded by two comparison callouts and one evidence mini-chart."


def visual_image_detail_fillers(title: str, context: str) -> List[str]:
    haystack = f"{title}\n{context}"
    if re.search(r"machine learning|deep learning|artificial intelligence|\bai\b|training data|classification|regression|supervised|unsupervised", haystack, flags=re.I):
        return [
            "train/test split",
            "feature columns",
            "loss curve",
            "confusion matrix",
            "overfitting gauge",
            "supervised labels",
            "NLP branch",
            "ethics warning",
            "business use case",
        ]
    if re.search(r"probability|conditional|union|intersection|venn|sample space", haystack, flags=re.I):
        return [
            "sample space",
            "A union B",
            "A intersection B",
            "given B",
            "overlap count",
            "independence check",
            "worked numbers",
            "common mistake",
        ]
    if re.search(r"\bmoney market\b|fisher effect|loanable funds|quantity theory|inflation|money multiplier", haystack, flags=re.I):
        return [
            "money demand",
            "money supply",
            "bank reserves",
            "multiplier",
            "MV = PY",
            "Fisher effect",
            "loanable funds",
            "policy lag",
        ]
    return ["key term", "evidence", "process arrow", "comparison", "worked example", "limitation", "revision check"]


def visual_image_allowed_text_labels(blueprint: dict) -> List[str]:
    labels: List[str] = []

    def add(value: str):
        text = clean_visual_guide_text(value)
        if not text or len(text) > 42:
            return
        if text.lower() in {item.lower() for item in labels}:
            return
        labels.append(text)

    add(blueprint.get("title") or "")
    for panel in blueprint.get("panels") or []:
        if not isinstance(panel, dict):
            continue
        add(panel.get("title") or "")
        for label in clean_visual_guide_list(panel.get("labels"), 2, 30):
            add(label)
    for item in blueprint.get("formula_tiles") or []:
        add(str(item))
    for item in blueprint.get("bottom_strip") or []:
        add(str(item))

    # These common spine labels are stable enough to render as large text.
    for item in ("Data", "Features", "Training", "Model", "Prediction", "Evaluation"):
        if any(item.lower() in label.lower() for label in labels):
            add(item)

    return labels[:24]


def visual_image_guide_fallback_blueprint(title: str, context: str) -> dict:
    panel_titles = visual_image_fallback_panel_titles(title, context)
    formulas = []
    formula_patterns = [
        r"\bMV\s*=\s*PY\b",
        r"\bi\s*≈\s*r\s*\+\s*π\^?e\b",
        r"\bP\([^)]+\)\s*=\s*[^.\n;]+",
        r"\b\d+(?:\.\d+)?\s*[%]\s*[+\-]\s*\d+(?:\.\d+)?\s*[%]\s*=\s*\d+(?:\.\d+)?\s*[%]",
    ]
    for pattern in formula_patterns:
        for match in re.finditer(pattern, context or "", flags=re.I):
            formulas.append(truncate_text(clean_visual_guide_text(match.group(0)), 42))
            if len(formulas) >= 4:
                break
        if len(formulas) >= 4:
            break
    blueprint = {
        "title": truncate_text(clean_visual_guide_text(title), 62),
        "subtitle": "A modern source-grounded overview",
        "central_visual": "Large central flow linking the main concepts with arrows and icons.",
        "middle_focus": visual_image_middle_focus(title, context),
        "panels": [
            {
                "title": item,
                "visual": "mini diagram, icon cluster, arrows, and one small chart where useful",
                "labels": [item],
                "detail": "Use the corresponding source concept as a visual panel."
            }
            for item in panel_titles[:10]
        ],
        "formula_tiles": formulas[:4],
        "mini_charts": ["comparison bars", "process arrow", "evidence callout"],
        "detail_fillers": visual_image_detail_fillers(title, context),
        "allowed_text_labels": [],
        "worked_example": "",
        "bottom_strip": ["Key terms", "Evidence", "Revision prompts"],
    }
    blueprint["allowed_text_labels"] = visual_image_allowed_text_labels(blueprint)
    return blueprint


def normalise_visual_image_blueprint(parsed: dict, title: str, context: str) -> dict:
    fallback = visual_image_guide_fallback_blueprint(title, context)
    if not isinstance(parsed, dict):
        parsed = {}

    raw_panels = parsed.get("panels") if isinstance(parsed.get("panels"), list) else []
    panels = []
    for index, raw in enumerate(raw_panels[:10]):
        if not isinstance(raw, dict):
            continue
        panel_title = truncate_text(clean_visual_guide_text(raw.get("title")), 42)
        visual = truncate_text(clean_visual_guide_text(raw.get("visual") or raw.get("visual_prompt")), 120)
        detail = truncate_text(clean_visual_guide_text(raw.get("detail") or raw.get("teaching_point")), 110)
        labels = clean_visual_guide_list(raw.get("labels"), 4, 32)
        labels = [clean_visual_guide_text(item) for item in labels if clean_visual_guide_text(item)]
        if panel_title and panel_title not in labels:
            labels.insert(0, panel_title)
        labels = labels[:4]
        if not panel_title:
            continue
        panels.append({
            "title": panel_title,
            "visual": visual or fallback["panels"][min(index, len(fallback["panels"]) - 1)]["visual"],
            "labels": labels,
            "detail": detail,
        })

    if len(panels) < 6:
        used = {panel["title"].lower() for panel in panels}
        for fallback_panel in fallback["panels"]:
            if fallback_panel["title"].lower() in used:
                continue
            panels.append(fallback_panel)
            if len(panels) >= 7:
                break

    formula_tiles = [
        truncate_text(clean_visual_guide_text(item), 46)
        for item in clean_visual_guide_list(parsed.get("formula_tiles") or parsed.get("formulas"), 4, 48)
    ] or fallback["formula_tiles"]

    normalised = {
        "title": truncate_text(clean_visual_guide_text(parsed.get("title") or title), 62),
        "subtitle": truncate_text(clean_visual_guide_text(parsed.get("subtitle") or fallback["subtitle"]), 70),
        "central_visual": truncate_text(clean_visual_guide_text(parsed.get("central_visual") or parsed.get("centralVisual") or fallback["central_visual"]), 140),
        "middle_focus": truncate_text(clean_visual_guide_text(parsed.get("middle_focus") or parsed.get("middleFocus") or fallback["middle_focus"]), 180),
        "panels": panels[:10],
        "formula_tiles": formula_tiles[:4],
        "mini_charts": [
            truncate_text(clean_visual_guide_text(item), 44)
            for item in clean_visual_guide_list(parsed.get("mini_charts") or parsed.get("charts"), 4, 46)
        ] or fallback["mini_charts"],
        "detail_fillers": [
            truncate_text(clean_visual_guide_text(item), 34)
            for item in clean_visual_guide_list(parsed.get("detail_fillers") or parsed.get("fillers") or parsed.get("micro_details"), 10, 36)
        ] or fallback["detail_fillers"],
        "worked_example": truncate_text(clean_visual_guide_text(parsed.get("worked_example") or parsed.get("example")), 120),
        "bottom_strip": [
            truncate_text(clean_visual_guide_text(item), 38)
            for item in clean_visual_guide_list(parsed.get("bottom_strip") or parsed.get("footer"), 4, 42)
        ] or fallback["bottom_strip"],
    }
    normalised["allowed_text_labels"] = visual_image_allowed_text_labels(normalised)
    return normalised


def build_visual_image_guide_blueprint(title: str, context: str, source_context: str, figure_context: str, preferred_language: str) -> dict:
    if os.getenv("VISUAL_IMAGE_GUIDE_BLUEPRINT", "true").lower() in {"0", "false", "no"}:
        fallback = visual_image_guide_fallback_blueprint(title, context)
        fallback["allowed_text_labels"] = visual_image_allowed_text_labels(fallback)
        return fallback

    language_rule = quiz_language_instruction(preferred_language)
    domain_guidance = visual_image_guide_domain_guidance(title, context)
    schema = """
Return JSON only:
{
  "title": "short poster title",
  "subtitle": "short subtitle",
  "central_visual": "one sentence describing the central visual metaphor or flow",
  "middle_focus": "specific content that must fill the central blank-prone area",
  "panels": [
    {
      "title": "1-4 word panel title",
      "visual": "specific drawing idea: diagram, icon group, chart, map, process arrow, or callout",
      "labels": ["short visible label", "short visible label"],
      "detail": "what this panel teaches"
    }
  ],
  "formula_tiles": ["short exact formula if needed"],
  "mini_charts": ["small chart or graph to include"],
  "detail_fillers": ["tiny visual detail to place in leftover space"],
  "worked_example": "one short worked-example visual if present",
  "bottom_strip": ["short footer label"]
}
"""
    prompt = f"""
Create a concise content blueprint for a generated educational infographic image.
This is NOT the final image prompt. It is the safe source-grounded content plan used by an image model.

Language requirement for visible labels: {language_rule}
Topic/title: {title}

Domain rules:
{domain_guidance}

Blueprint rules:
- Use only facts, concepts, formulas, examples, and relationships from the notes/source.
- Design for a professional dense grid infographic like a textbook "modern overview" poster.
- Choose 8-10 panels. Each panel needs a concrete visual, not just text.
- Add a middle_focus item that explicitly fills the central area between major panels.
- Add 6-10 detail_fillers that can be used as visual-only icons, mini charts, badges, arrows, or callouts in leftover space.
- Visible labels must be short and spellable: usually 1-4 words, never paragraph sentences.
- Keep total visible text under about 120 words. Prefer icons, arrows, charts, and diagrams for detail.
- Include a worked-example visual if the notes contain calculations, examples, source exercises, or model answers.
- Include exact formulas only when central; do not invent formulas from another subject.
- Never include pseudo-text, filler text, browser UI, app buttons, or unrelated domain examples.
{schema}

Generated notes:
{truncate_text(context, 9000)}

Source metadata/excerpts:
{truncate_text(source_context or "No separate source metadata supplied.", 2200)}

Available source figures:
{truncate_text(figure_context or "No source figures supplied.", 1800)}
"""
    try:
        raw = generate_chat(
            [
                {"role": "system", "content": "You create concise infographic blueprints as strict JSON. Do not include markdown fences or prose outside JSON."},
                {"role": "user", "content": prompt},
            ],
            model=model_for_depth("standard"),
            temperature=float(os.getenv("VISUAL_IMAGE_GUIDE_BLUEPRINT_TEMPERATURE", "0.18")),
            max_tokens=env_int("VISUAL_IMAGE_GUIDE_BLUEPRINT_TOKENS", 3200),
        )
        parsed = extract_json_object(raw)
        return normalise_visual_image_blueprint(parsed or {}, title, context)
    except Exception:
        fallback = visual_image_guide_fallback_blueprint(title, context)
        fallback["allowed_text_labels"] = visual_image_allowed_text_labels(fallback)
        return fallback


def visual_image_blueprint_text(blueprint: dict) -> str:
    panels = blueprint.get("panels") if isinstance(blueprint.get("panels"), list) else []
    panel_lines = []
    for index, panel in enumerate(panels[:10], start=1):
        if not isinstance(panel, dict):
            continue
        labels = ", ".join(clean_visual_guide_list(panel.get("labels"), 4, 32))
        label_text = f" Labels: {labels}." if labels else ""
        detail = panel.get("detail") or ""
        detail_text = f" Teaches: {detail}." if detail else ""
        panel_lines.append(f"{index}. {panel.get('title')}: {panel.get('visual')}.{label_text}{detail_text}")
    formulas = "; ".join(blueprint.get("formula_tiles") or [])
    charts = "; ".join(blueprint.get("mini_charts") or [])
    footer = "; ".join(blueprint.get("bottom_strip") or [])
    allowed_labels = "; ".join(blueprint.get("allowed_text_labels") or visual_image_allowed_text_labels(blueprint))
    return "\n".join([
        f"Title: {blueprint.get('title')}",
        f"Subtitle: {blueprint.get('subtitle')}",
        f"Central visual: {blueprint.get('central_visual')}",
        f"Middle focus: {blueprint.get('middle_focus')}",
        "Panels:",
        *panel_lines,
        f"Formula tiles: {formulas or 'none'}",
        f"Mini charts: {charts or 'source-specific small diagrams'}",
        f"Detail fillers: {'; '.join(blueprint.get('detail_fillers') or []) or 'small source-specific icons and callouts'}",
        f"Worked example: {blueprint.get('worked_example') or 'include only if clearly present'}",
        f"Bottom strip: {footer or 'key takeaway labels'}",
        f"Visible text whitelist (copy exactly or omit): {allowed_labels or 'title and large panel labels only'}",
    ]).strip()


def enhance_visual_image_guide_b64(image_b64: str) -> Tuple[str, dict]:
    if os.getenv("VISUAL_IMAGE_GUIDE_ENHANCE_LOCAL", "true").lower() in {"0", "false", "no"}:
        return image_b64, {"enhanced": False, "reason": "disabled"}
    try:
        from PIL import Image, ImageEnhance, ImageFilter

        raw = base64.b64decode(image_b64)
        img = Image.open(BytesIO(raw)).convert("RGB")
        original_size = img.size
        scale_percent = max(100, min(220, env_int("VISUAL_IMAGE_GUIDE_UPSCALE_PERCENT", 100)))
        max_pixels = max(1_800_000, env_int("VISUAL_IMAGE_GUIDE_MAX_ENHANCED_PIXELS", 5_200_000))
        scale = scale_percent / 100
        target_pixels = int(original_size[0] * scale) * int(original_size[1] * scale)
        if target_pixels > max_pixels:
            scale = (max_pixels / max(1, original_size[0] * original_size[1])) ** 0.5
        if scale > 1.01:
            resampling = getattr(Image, "Resampling", None)
            resample = resampling.LANCZOS if resampling else getattr(Image, "LANCZOS", 1)
            target_size = (max(1, int(original_size[0] * scale)), max(1, int(original_size[1] * scale)))
            img = img.resize(target_size, resample)

        img = ImageEnhance.Contrast(img).enhance(float(os.getenv("VISUAL_IMAGE_GUIDE_CONTRAST", "1.04")))
        img = ImageEnhance.Sharpness(img).enhance(float(os.getenv("VISUAL_IMAGE_GUIDE_SHARPNESS", "1.14")))
        img = img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=85, threshold=3))

        out = BytesIO()
        img.save(out, format="PNG", optimize=True)
        enhanced = base64.b64encode(out.getvalue()).decode("ascii")
        return enhanced, {
            "enhanced": True,
            "original_size": list(original_size),
            "final_size": list(img.size),
            "upscale_percent": int(round((img.size[0] / max(1, original_size[0])) * 100)),
        }
    except Exception as error:
        return image_b64, {"enhanced": False, "error": truncate_text(str(error), 180)}


def visual_image_renderer_mode() -> str:
    return (os.getenv("VISUAL_IMAGE_GUIDE_RENDERER") or "local").strip().lower()


def visual_image_use_local_renderer() -> bool:
    return visual_image_renderer_mode() not in {"gpt", "openai", "image-api", "image_api"}


def parse_visual_image_size(size: str) -> Tuple[int, int]:
    match = re.match(r"^\s*(\d{3,4})\s*x\s*(\d{3,4})\s*$", str(size or ""), flags=re.I)
    if not match:
        return 1536, 1024
    width = max(900, min(2400, int(match.group(1))))
    height = max(600, min(1800, int(match.group(2))))
    return width, height


def visual_image_contains_cjk(text: str) -> bool:
    return bool(re.search(r"[\u3400-\u9fff]", str(text or "")))


def visual_image_prefers_chinese(preferred_language: str, blueprint: dict) -> bool:
    language = normalise_language_key(preferred_language)
    if language in {"zh", "zh-cn", "chinese", "simplified_chinese", "traditional_chinese"}:
        return True
    sample = " ".join([
        str(blueprint.get("title") or ""),
        str(blueprint.get("subtitle") or ""),
        " ".join(str((panel or {}).get("title") or "") for panel in (blueprint.get("panels") or []) if isinstance(panel, dict)),
    ])
    return visual_image_contains_cjk(sample)


def visual_image_font(size: int, bold: bool = False):
    from PIL import ImageFont

    candidates = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc" if bold else "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        try:
            path = Path(candidate)
            if path.exists():
                return ImageFont.truetype(str(path), size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def visual_image_text_size(draw, text: str, font) -> Tuple[int, int]:
    bbox = draw.textbbox((0, 0), str(text or ""), font=font)
    return max(0, bbox[2] - bbox[0]), max(0, bbox[3] - bbox[1])


def visual_image_fit_text(draw, text: str, max_width: int, start_size: int, min_size: int = 18, bold: bool = False):
    text = normalise_space(str(text or ""))
    size = start_size
    font = visual_image_font(size, bold=bold)
    while size > min_size and visual_image_text_size(draw, text, font)[0] > max_width:
        size -= 2
        font = visual_image_font(size, bold=bold)
    return font


def visual_image_wrap_text(draw, text: str, font, max_width: int, max_lines: int = 3) -> List[str]:
    text = normalise_space(str(text or ""))
    if not text or max_width <= 0 or max_lines <= 0:
        return []
    if visual_image_contains_cjk(text):
        tokens = list(text)
        separator = ""
    else:
        tokens = text.split()
        separator = " "
    lines: List[str] = []
    current = ""
    for token in tokens:
        candidate = f"{current}{separator if current and separator else ''}{token}"
        if not current or visual_image_text_size(draw, candidate, font)[0] <= max_width:
            current = candidate
            continue
        lines.append(current)
        current = token
        if len(lines) >= max_lines:
            break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
    if lines and len(lines) == max_lines:
        while lines[-1] and visual_image_text_size(draw, f"{lines[-1]}...", font)[0] > max_width:
            lines[-1] = lines[-1][:-1].rstrip()
        if lines[-1] and lines[-1] != text:
            lines[-1] = f"{lines[-1]}..."
    return lines


def visual_image_draw_wrapped(draw, xy: Tuple[int, int], text: str, font, fill: str, max_width: int, max_lines: int = 3, line_gap: int = 8) -> int:
    x, y = xy
    lines = visual_image_wrap_text(draw, text, font, max_width, max_lines=max_lines)
    line_height = visual_image_text_size(draw, "Ag", font)[1] + line_gap
    for index, line in enumerate(lines):
        draw.text((x, y + index * line_height), line, font=font, fill=fill)
    return y + len(lines) * line_height


def visual_image_draw_arrow(draw, start: Tuple[int, int], end: Tuple[int, int], fill: str = "#294563", width: int = 4) -> None:
    draw.line([start, end], fill=fill, width=width)
    x1, y1 = start
    x2, y2 = end
    dx = x2 - x1
    dy = y2 - y1
    length = max(1, (dx * dx + dy * dy) ** 0.5)
    ux = dx / length
    uy = dy / length
    size = 13 + width
    left = (x2 - ux * size - uy * size * 0.55, y2 - uy * size + ux * size * 0.55)
    right = (x2 - ux * size + uy * size * 0.55, y2 - uy * size - ux * size * 0.55)
    draw.polygon([end, left, right], fill=fill)


def visual_image_draw_icon(draw, box: Tuple[int, int, int, int], kind: str, accent: str) -> None:
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1
    cx = x1 + w // 2
    cy = y1 + h // 2
    navy = "#12213a"
    soft = "#f4f8fb"
    kind = (kind or "").lower()
    if "chart" in kind or "evaluation" in kind or "accuracy" in kind:
        for idx, height in enumerate((34, 52, 42, 65)):
            bx = x1 + 14 + idx * 26
            draw.rounded_rectangle((bx, y2 - 14 - height, bx + 16, y2 - 14), radius=4, fill=accent)
        draw.line((x1 + 10, y2 - 14, x2 - 10, y2 - 14), fill=navy, width=3)
    elif "network" in kind or "model" in kind or "neural" in kind:
        points = [(x1 + 20, cy), (cx, y1 + 20), (cx, y2 - 20), (x2 - 20, cy)]
        for p1 in points[:3]:
            draw.line((p1, points[-1]), fill="#87a3bc", width=3)
        for point in points:
            draw.ellipse((point[0] - 10, point[1] - 10, point[0] + 10, point[1] + 10), fill=soft, outline=accent, width=4)
    elif "venn" in kind or "union" in kind or "intersection" in kind:
        draw.ellipse((x1 + 18, y1 + 16, cx + 14, y2 - 14), fill="#bde8ef", outline=navy, width=3)
        draw.ellipse((cx - 14, y1 + 16, x2 - 18, y2 - 14), fill="#d9ecc7", outline=navy, width=3)
    elif "warning" in kind or "risk" in kind or "ethic" in kind or "limit" in kind:
        draw.polygon([(cx, y1 + 14), (x2 - 18, y2 - 16), (x1 + 18, y2 - 16)], fill="#fee7a9", outline=navy)
        draw.line((cx, cy - 12, cx, cy + 16), fill=navy, width=5)
        draw.ellipse((cx - 3, cy + 24, cx + 3, cy + 30), fill=navy)
    elif "data" in kind or "table" in kind:
        draw.rounded_rectangle((x1 + 14, y1 + 16, x2 - 14, y2 - 16), radius=12, fill=soft, outline=navy, width=3)
        for row in range(3):
            y = y1 + 30 + row * 22
            draw.line((x1 + 22, y, x2 - 22, y), fill="#b7c6d5", width=2)
        for col in range(3):
            x = x1 + 34 + col * 34
            draw.rounded_rectangle((x, y1 + 42, x + 18, y1 + 58), radius=4, fill=accent)
    else:
        draw.rounded_rectangle((x1 + 20, y1 + 18, x2 - 20, y2 - 18), radius=16, fill=soft, outline=navy, width=3)
        draw.arc((x1 + 38, y1 + 32, x2 - 38, y2 - 32), start=25, end=325, fill=accent, width=6)
        visual_image_draw_arrow(draw, (cx - 30, cy + 16), (cx + 30, cy - 16), fill=accent, width=4)


def visual_image_draw_panel(draw, box: Tuple[int, int, int, int], title: str, detail: str, visual: str, accent: str) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=18, fill="#ffffff", outline="#cad7e6", width=2)
    draw.rounded_rectangle((x1, y1, x2, y1 + 48), radius=18, fill=accent)
    draw.rectangle((x1, y1 + 30, x2, y1 + 48), fill=accent)
    title_font = visual_image_fit_text(draw, title, x2 - x1 - 34, 24, min_size=16, bold=True)
    draw.text((x1 + 16, y1 + 12), title, font=title_font, fill="#ffffff")
    icon_box = (x1 + 14, y1 + 65, x1 + 126, y1 + 158)
    visual_image_draw_icon(draw, icon_box, f"{title} {visual}", accent)
    body_font = visual_image_font(18)
    body = detail or visual or title
    visual_image_draw_wrapped(draw, (x1 + 140, y1 + 68), body, body_font, "#31425a", x2 - x1 - 156, max_lines=3, line_gap=6)


def visual_image_spine_labels(preferred_language: str, blueprint: dict) -> List[str]:
    if visual_image_prefers_chinese(preferred_language, blueprint):
        return ["数据", "特征", "训练", "模型", "预测", "评估"]
    return ["Data", "Features", "Training", "Model", "Prediction", "Evaluation"]


def render_visual_image_guide_local_b64(title: str, blueprint: dict, preferred_language: str) -> Tuple[str, dict]:
    from PIL import Image, ImageDraw

    width, height = parse_visual_image_size(VISUAL_IMAGE_GUIDE_SIZE)
    img = Image.new("RGB", (width, height), "#edf4f8")
    draw = ImageDraw.Draw(img)

    navy = "#152541"
    deep = "#203a5b"
    text = "#162033"
    muted = "#60708a"
    panel_colors = ["#2c6b83", "#2d7d69", "#c45f45", "#526a9f", "#66843e", "#8a5f9d", "#3f7caa", "#a86a34", "#557a75", "#9b5b5b"]
    title_text = truncate_text(clean_visual_guide_text(blueprint.get("title") or title), 54)
    subtitle_text = truncate_text(clean_visual_guide_text(blueprint.get("subtitle") or ""), 72)

    margin = 38
    header_h = 116
    draw.rounded_rectangle((margin, 24, width - margin, 24 + header_h), radius=22, fill=navy)
    title_font = visual_image_fit_text(draw, title_text, width - margin * 4, 62, min_size=34, bold=True)
    title_w, title_h = visual_image_text_size(draw, title_text, title_font)
    draw.text(((width - title_w) // 2, 48), title_text, font=title_font, fill="#ffffff")
    if subtitle_text:
        subtitle_font = visual_image_fit_text(draw, subtitle_text, width - margin * 6, 28, min_size=18, bold=False)
        sub_w, _ = visual_image_text_size(draw, subtitle_text, subtitle_font)
        draw.text(((width - sub_w) // 2, 104), subtitle_text, font=subtitle_font, fill="#b9d8f0")

    panels = [panel for panel in (blueprint.get("panels") or []) if isinstance(panel, dict)]
    if len(panels) < 8:
        panels = (panels + visual_image_guide_fallback_blueprint(title, "").get("panels", []))[:8]
    panels = panels[:10]

    content_top = 166
    content_bottom = height - 86
    left_x = margin
    right_w = 346
    left_w = 346
    right_x = width - margin - right_w
    center_x = left_x + left_w + 24
    center_w = right_x - center_x - 24
    panel_h = 158
    panel_gap = 18

    for index, panel in enumerate(panels[:4]):
        y = content_top + index * (panel_h + panel_gap)
        visual_image_draw_panel(
            draw,
            (left_x, y, left_x + left_w, y + panel_h),
            truncate_text(clean_visual_guide_text(panel.get("title")), 34),
            truncate_text(clean_visual_guide_text(panel.get("detail") or panel.get("visual")), 120),
            clean_visual_guide_text(panel.get("visual")),
            panel_colors[index % len(panel_colors)],
        )

    for index, panel in enumerate(panels[4:8]):
        y = content_top + index * (panel_h + panel_gap)
        visual_image_draw_panel(
            draw,
            (right_x, y, right_x + right_w, y + panel_h),
            truncate_text(clean_visual_guide_text(panel.get("title")), 34),
            truncate_text(clean_visual_guide_text(panel.get("detail") or panel.get("visual")), 120),
            clean_visual_guide_text(panel.get("visual")),
            panel_colors[(index + 4) % len(panel_colors)],
        )

    center_top = content_top
    center_bottom = content_bottom - 120
    draw.rounded_rectangle((center_x, center_top, center_x + center_w, center_bottom), radius=22, fill="#ffffff", outline="#cad7e6", width=2)
    center_title = "Learning Mechanism" if not visual_image_prefers_chinese(preferred_language, blueprint) else "学习机制"
    center_title_font = visual_image_font(30, bold=True)
    draw.text((center_x + 24, center_top + 20), center_title, font=center_title_font, fill=text)

    labels = visual_image_spine_labels(preferred_language, blueprint)
    node_y = center_top + 86
    node_w = max(84, int((center_w - 82) / len(labels)))
    node_h = 58
    node_gap = max(8, int((center_w - 52 - node_w * len(labels)) / max(1, len(labels) - 1)))
    node_centers = []
    for index, label in enumerate(labels):
        x = center_x + 26 + index * (node_w + node_gap)
        color = panel_colors[index % len(panel_colors)]
        draw.rounded_rectangle((x, node_y, x + node_w, node_y + node_h), radius=16, fill=color)
        label_font = visual_image_fit_text(draw, label, node_w - 18, 25, min_size=16, bold=True)
        label_w, label_h = visual_image_text_size(draw, label, label_font)
        draw.text((x + (node_w - label_w) / 2, node_y + (node_h - label_h) / 2 - 1), label, font=label_font, fill="#ffffff")
        center = (x + node_w, node_y + node_h // 2)
        node_centers.append((x, x + node_w, center))
        if index:
            prev = node_centers[index - 1][2]
            visual_image_draw_arrow(draw, (prev[0] + 4, prev[1]), (x - 8, node_y + node_h // 2), fill="#44627f", width=4)

    main_box = (center_x + 46, node_y + 100, center_x + center_w - 46, center_bottom - 78)
    draw.rounded_rectangle(main_box, radius=24, fill="#f7fbfd", outline="#d2deea", width=2)
    mx1, my1, mx2, my2 = main_box
    icon_w = min(156, max(112, int((mx2 - mx1 - 104) / 3)))
    icon_h = 138
    icon_gap = max(24, int((mx2 - mx1 - icon_w * 3) / 4))
    icon_y = my1 + 34
    icon_boxes = []
    for idx in range(3):
        ix = mx1 + icon_gap + idx * (icon_w + icon_gap)
        icon_boxes.append((ix, icon_y, ix + icon_w, icon_y + icon_h))
    visual_image_draw_icon(draw, icon_boxes[0], "data table", "#2c6b83")
    visual_image_draw_icon(draw, icon_boxes[1], "network model", "#2d7d69")
    visual_image_draw_icon(draw, icon_boxes[2], "evaluation chart", "#c45f45")
    visual_image_draw_arrow(draw, (icon_boxes[0][2] + 6, icon_y + icon_h // 2), (icon_boxes[1][0] - 8, icon_y + icon_h // 2), fill="#44627f", width=5)
    visual_image_draw_arrow(draw, (icon_boxes[1][2] + 6, icon_y + icon_h // 2), (icon_boxes[2][0] - 8, icon_y + icon_h // 2), fill="#44627f", width=5)

    fillers = [
        truncate_text(clean_visual_guide_text(item), 28)
        for item in (blueprint.get("detail_fillers") or [])
        if clean_visual_guide_text(item)
    ]
    chip_font = visual_image_font(16, bold=True)
    chip_y = icon_y + icon_h + 24
    chip_w = int((mx2 - mx1 - 76) / 2)
    for idx, filler in enumerate(fillers[:4]):
        cx = mx1 + 26 + (idx % 2) * (chip_w + 24)
        cy = chip_y + (idx // 2) * 42
        color = panel_colors[(idx + 2) % len(panel_colors)]
        draw.rounded_rectangle((cx, cy, cx + chip_w, cy + 30), radius=13, fill="#ffffff", outline="#d2deea", width=2)
        draw.ellipse((cx + 12, cy + 9, cx + 24, cy + 21), fill=color)
        label_font = visual_image_fit_text(draw, filler, chip_w - 48, 16, min_size=12, bold=True)
        draw.text((cx + 34, cy + 7), filler, font=label_font, fill="#31425a")

    focus_text = clean_visual_guide_text(blueprint.get("middle_focus") or blueprint.get("central_visual") or "")
    focus_font = visual_image_font(22)
    visual_image_draw_wrapped(draw, (mx1 + 28, my2 - 90), focus_text, focus_font, "#31425a", mx2 - mx1 - 56, max_lines=3, line_gap=7)

    formulas = [clean_visual_guide_text(item) for item in (blueprint.get("formula_tiles") or []) if clean_visual_guide_text(item)]
    chart_labels = [clean_visual_guide_text(item) for item in (blueprint.get("mini_charts") or []) if clean_visual_guide_text(item)]
    small_top = center_bottom + 20
    small_h = 92
    small_w = int((center_w - 36) / 2)
    for idx, label in enumerate((formulas + chart_labels + (blueprint.get("bottom_strip") or []))[:2]):
        x = center_x + idx * (small_w + 36)
        draw.rounded_rectangle((x, small_top, x + small_w, small_top + small_h), radius=18, fill="#ffffff", outline="#cad7e6", width=2)
        draw.rectangle((x + 18, small_top + 20, x + 26, small_top + small_h - 20), fill=panel_colors[(idx + 6) % len(panel_colors)])
        label_font = visual_image_fit_text(draw, str(label), small_w - 68, 26, min_size=17, bold=True)
        visual_image_draw_wrapped(draw, (x + 42, small_top + 24), str(label), label_font, text, small_w - 68, max_lines=2, line_gap=6)

    bottom_items = [clean_visual_guide_text(item) for item in (blueprint.get("bottom_strip") or []) if clean_visual_guide_text(item)]
    if not bottom_items:
        bottom_items = ["Key terms", "Evidence", "Revision prompts"]
    strip_y = height - 62
    draw.rounded_rectangle((margin, strip_y, width - margin, height - 24), radius=16, fill=deep)
    chip_font = visual_image_font(21, bold=True)
    chip_x = margin + 28
    for item in bottom_items[:4]:
        item = truncate_text(item, 30)
        item_w = min(300, visual_image_text_size(draw, item, chip_font)[0] + 32)
        draw.rounded_rectangle((chip_x, strip_y + 8, chip_x + item_w, height - 32), radius=14, fill="#ffffff")
        draw.text((chip_x + 16, strip_y + 15), item, font=chip_font, fill=deep)
        chip_x += item_w + 18
        if chip_x > width - 250:
            break

    out = BytesIO()
    img.save(out, format="PNG", optimize=True)
    image_b64 = base64.b64encode(out.getvalue()).decode("ascii")
    return image_b64, {
        "enhanced": False,
        "renderer": "local-pillow",
        "final_size": [width, height],
        "text_rendering": "native-font",
    }


def visual_image_guide_prompt(title: str, context: str, source_context: str, figure_context: str, preferred_language: str, blueprint: Optional[dict] = None) -> str:
    language_rule = quiz_language_instruction(preferred_language)
    diagram_rules = visual_image_guide_diagram_rules(context)
    domain_guidance = visual_image_guide_domain_guidance(title, context)
    blueprint = blueprint or visual_image_guide_fallback_blueprint(title, context)
    blueprint_text = visual_image_blueprint_text(blueprint)
    return f"""
Create one finished educational visual image guide as a high-detail, high-clarity portrait infographic.

This is NOT an HTML card layout and NOT a wireframe. The output should be one real generated image: a coherent study poster / infographic that visually teaches the source.

Language requirement for any visible text: {language_rule}
Topic/title: {title}

Use this content blueprint exactly. Do not add unrelated concepts:
{blueprint_text}

Mandatory diagram accuracy rules:
{diagram_rules}

Domain-specific visual rules:
{domain_guidance}

Design goals:
- Match the second reference style: a crisp editorial grid infographic with a strong title band, 8-10 structured panels, clean dividers, icon systems, arrows, mini charts, callouts, and a bottom takeaway strip.
- Use a modern academic palette: navy headers, pale blue/green panels, dark readable labels, precise black linework, and subtle accent colors for warnings or examples.
- Make it visually detailed through diagrams, icons, chart marks, arrows, small scenes, legends, and comparison blocks, not through paragraphs.
- Do not leave a large empty middle band. The central 45% of the poster must contain the middle_focus mechanism, connecting arrows, two mini charts, and several detail_fillers.
- Fill unused white space with meaningful micro-content: unlabelled icons, legend chips, tiny charts without words, arrows, badges, or comparison insets from detail_fillers.
- Balance density across the canvas: no blank rectangle should be visually larger than one small panel.
- Use only the exact Visible text whitelist from the blueprint. Copy each phrase exactly or omit it. Do not invent any other visible words.
- Visible text must be large, horizontal, and spelled correctly. No paragraph text blocks, no tiny text, no labels on small documents/cards/faces/data rows.
- In the central middle_focus area, use iconography and arrows. If a label would be smaller than a panel title, replace it with a numbered badge or an icon.
- Include a clearly labelled worked-example area only if the blueprint contains one, with givens, operation arrow, and result.
- Do not imitate the current website UI. Do not draw browser chrome, buttons, cards from the app, or screenshots.
- Avoid malformed mathematical notation. Keep equations short, clean, and visually separated.
- Before finalizing, visually audit labels for diagram correctness. If a graph contains both supply and demand, make sure their labels are not duplicated or swapped.
- Absolutely avoid fake filler text, misspelled pseudo-words, unrelated formulas, and generic lorem ipsum. If text would be too small, replace it with icons/arrows.
""".strip()


@app.post("/visual-image-guide/generate")
async def generate_visual_image_guide(data: dict):
    try:
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
        blueprint = build_visual_image_guide_blueprint(title, context, source_context, figure_context, preferred_language)
        prompt = visual_image_guide_prompt(title, context, source_context, figure_context, preferred_language, blueprint)

        if visual_image_use_local_renderer():
            image_b64, image_processing = render_visual_image_guide_local_b64(title, blueprint, preferred_language)
            width, height = parse_visual_image_size(VISUAL_IMAGE_GUIDE_SIZE)
            return {
                "title": title,
                "image_data_url": f"data:image/png;base64,{image_b64}",
                "model": "synapse-local-image-renderer",
                "size": f"{width}x{height}",
                "quality": "readable-text",
                "style_version": VISUAL_IMAGE_GUIDE_STYLE_VERSION,
                "blueprint": blueprint,
                "image_processing": image_processing,
                "created": int(time.time()),
            }

        require_openai()
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
        image_b64, image_processing = enhance_visual_image_guide_b64(image_b64)

        return {
            "title": title,
            "image_data_url": f"data:image/png;base64,{image_b64}",
            "model": VISUAL_IMAGE_GUIDE_MODEL,
            "size": VISUAL_IMAGE_GUIDE_SIZE,
            "quality": VISUAL_IMAGE_GUIDE_QUALITY,
            "style_version": VISUAL_IMAGE_GUIDE_STYLE_VERSION,
            "blueprint": blueprint,
            "image_processing": image_processing,
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
