import streamlit as st
from tastedive import search_movie, show_results

st.set_page_config(page_title="Movies", layout="wide")
st.title("Movies Database")

col1, col2, col3 = st.columns([0.65, 0.25, 0.1], width="stretch")

with col1:
    search = st.text_input(label="Search" ,placeholder="Search for movies")
with col2:
    media_type = st.selectbox("Type", ("music","movie","show","book","game","podcast","person","place","brand"))
with col3:
    st.markdown("<br>", unsafe_allow_html=True)  # pushes button down
    run = st.button(label="▶️ Run")

if run:
    if not search:
        st.error("Please enter a search query.")
    else:
        data = search_movie(search, media_type)
        show_results(data)