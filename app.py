import streamlit as st

st.title("AI Study Assistant")

question = st.text_input("Ask something:")

if question:
    st.write("You asked:", question)

### To run this Streamlit app, use the following command:
### streamlit run app.py