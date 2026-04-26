import os
import re
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

st.set_page_config(page_title="AI Study Assistant", layout="wide")

SYSTEM_PROMPT = """
You are an advanced academic study assistant for university students.

Your role:
- Help students understand academic readings clearly
- Connect ideas across sections and articles
- Explain concepts at university level
- Prioritise critical analysis over simple summary
- Use structured headings when useful
- If the document does not contain enough evidence, say so clearly
"""

if "messages" not in st.session_state:
    st.session_state.messages = [{"role": "system", "content": SYSTEM_PROMPT}]

if "sections" not in st.session_state:
    st.session_state.sections = {}

if "selected_section" not in st.session_state:
    st.session_state.selected_section = None


def extract_pdf_text(uploaded_file):
    reader = PdfReader(uploaded_file)
    full_text = ""

    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"

    return full_text


def split_into_sections(text):
    """
    Simple heading detector.
    It looks for lines like:
    Chapter 1
    1. Introduction
    Introduction
    Globalisation and Trade
    """

    lines = text.split("\n")
    sections = {}
    current_heading = "Document Overview"
    current_content = []

    heading_pattern = re.compile(
        r"^(\d+(\.\d+)*\s+.+|Chapter\s+\d+.*|[A-Z][A-Za-z\s:&,-]{4,80})$"
    )

    for line in lines:
        clean_line = line.strip()

        if not clean_line:
            continue

        is_heading = (
            heading_pattern.match(clean_line)
            and len(clean_line.split()) <= 10
        )

        if is_heading:
            if current_content:
                sections[current_heading] = "\n".join(current_content)

            current_heading = clean_line
            current_content = []
        else:
            current_content.append(clean_line)

    if current_content:
        sections[current_heading] = "\n".join(current_content)

    return sections


st.title("AI Study Assistant")
st.caption("PDF reading assistant with structured heading navigation")

uploaded_file = st.file_uploader("Upload a PDF reading", type="pdf")

if uploaded_file:
    pdf_text = extract_pdf_text(uploaded_file)
    sections = split_into_sections(pdf_text)

    st.session_state.sections = sections
    st.success("PDF uploaded and structured into sections.")


# Sidebar navigation
st.sidebar.title("Reading Navigation")

if st.session_state.sections:
    section_titles = list(st.session_state.sections.keys())

    selected = st.sidebar.radio(
        "Select a section:",
        section_titles
    )

    st.session_state.selected_section = selected
else:
    st.sidebar.info("Upload a PDF to generate headings.")


# Main layout
left_col, right_col = st.columns([1.2, 1])

with left_col:
    st.subheader("Selected Section")

    if st.session_state.selected_section:
        section_text = st.session_state.sections[
            st.session_state.selected_section
        ]

        st.markdown(f"### {st.session_state.selected_section}")
        st.write(section_text[:4000])

        if len(section_text) > 4000:
            st.info("Only showing the first part of this section.")
    else:
        st.info("Upload a PDF and choose a section from the sidebar.")


with right_col:
    st.subheader("Academic AI Assistant")

    for message in st.session_state.messages:
        if message["role"] != "system":
            with st.chat_message(message["role"]):
                st.write(message["content"])

    question = st.chat_input("Ask about this section or the whole reading...")

    if question:
        st.session_state.messages.append(
            {"role": "user", "content": question}
        )

        with st.chat_message("user"):
            st.write(question)

        selected_section = st.session_state.selected_section

        if selected_section:
            section_context = st.session_state.sections[selected_section]
        else:
            section_context = ""

        all_headings = "\n".join(st.session_state.sections.keys())

        academic_prompt = f"""
The student is reading an academic document.

Available headings:
{all_headings}

Current selected section:
{selected_section}

Section content:
{section_context[:10000]}

Student question:
{question}

Answer the question using the current section where relevant.
If useful, connect the answer to other headings in the document.
"""

        api_messages = st.session_state.messages[:-1] + [
            {"role": "user", "content": academic_prompt}
        ]

        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=api_messages
                )

                answer = response.choices[0].message.content
                st.write(answer)

        st.session_state.messages.append(
            {"role": "assistant", "content": answer}
        )

    if st.button("Clear chat"):
        st.session_state.messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        st.rerun()