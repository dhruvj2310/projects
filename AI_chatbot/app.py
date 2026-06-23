import os
import streamlit as st
from functions.call import api_call


# -----------------------------
# Page Config
# -----------------------------
st.set_page_config(
    page_title="AI Chat",
    page_icon="🤖",
    layout="wide"
)

# -----------------------------
# Session State
# -----------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

# -----------------------------
# Sidebar
# -----------------------------
with st.sidebar:
    st.title("🤖 AI Chat")
    st.divider()

    if st.button("➕ New Chat"):
        st.session_state.messages = []
        st.rerun()

# -----------------------------
# Chat Messages
# -----------------------------
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# -----------------------------
# User Input
# -----------------------------
if prompt := st.chat_input("Ask anything..."):

    # Store user message
    st.session_state.messages.append(
        {"role": "user", "content": prompt}
    )

    with st.chat_message("user"):
        st.markdown(prompt)

    # Assistant response
    with st.chat_message("assistant"):

        with st.spinner("Thinking..."):

            try:
                response = api_call(prompt)

                # Adjust this depending on OpenRouter SDK response format
                answer = response

            except Exception as e:
                answer = f"Error: {str(e)}"

            st.markdown(answer)

    st.session_state.messages.append(
        {"role": "assistant", "content": answer}
    )