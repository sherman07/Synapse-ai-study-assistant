import os
import streamlit as st
from dotenv import load_dotenv
from openai import OpenAI

# Read .env
load_dotenv()

# Initialize client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

st.title("AI Study Assistant")

question = st.text_input("Ask something:")

if question:
    with st.spinner("Thinking..."):
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role":"system",
                    "content":
                    "You are an academic assistant helping university students understand readings."
                },
                {
                    "role":"user",
                    "content":question
                }
            ]
        )

    answer = response.choices[0].message.content

    st.write(answer)