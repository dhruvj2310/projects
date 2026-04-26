import streamlit as st
import pandas as pd

st.set_page_config(layout="wide")

df = pd.read_csv("/Users/dhruvjadav/Documents/Projects/github_repo/projects/games_data/Video Games Sales (1980-2024).csv")
df["release_date"] = pd.to_datetime(df["release_date"], errors="coerce")
df["release_date_display"] = df["release_date"].dt.strftime("%Y-%m-%d")
df["release_year"] = df["release_date"].dt.year

st.title("GAME-O-HOLIC :joystick:", text_alignment="center", width="stretch")

page, sidebar = st.columns([7, 3], width="stretch")

filtered_df = df.copy()

with sidebar:
    console = st.selectbox("Console", options=sorted(set(filtered_df["console"])), index=None, placeholder="Select")
    genre = st.selectbox("Genre", options=sorted(set(filtered_df["genre"])), index=None, placeholder="Select")
    release_year = st.selectbox("Year", options=range(1980, 2025), index=None, placeholder="Select")

# Filter by console
if console:
    filtered_df = filtered_df[filtered_df["console"] == console]

# Filter by genre
if genre:
    filtered_df = filtered_df[filtered_df["genre"] == genre]

# Filter by release year
if release_year:
    filtered_df = filtered_df[
        filtered_df["release_date"].dt.year == release_year
    ]

with page:
    st.dataframe(
        filtered_df[["title", "console", "genre", "publisher", "developer", "release_date_display"]],
        hide_index=True
    )
