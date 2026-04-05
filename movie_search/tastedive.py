import requests
import streamlit as st
import os
from utils.helpers import clean_q
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("API_KEY")
api_url = os.getenv("API_URL")



def search_movie(text, valid_types):
    response = requests.get(f"{api_url}?q={clean_q(text)}&type={valid_types}&k={api_key}&verbose=1")
    resp_json = response.json()
    return resp_json

def show_results(resp_json):
    results = resp_json.get("similar", {}).get("results", [])

    if not results:
        st.warning("No results found.")
        return

    st.subheader(f"Results ({len(results)})")

    for i, item in enumerate(results, start=1):
        name = item.get("name", "Unknown")
        wurl = item.get("wUrl")
        yurl = item.get("yUrl")
        yid = item.get("yID")
        teaser = item.get("wTeaser")

        with st.container():
            st.markdown(f"# {name}")  

            col1, col2 = st.columns([0.6, 0.4])

            with col1:
                if teaser:
                    st.write(teaser)
                else:
                    st.caption("No description available.")

                links = []
                if wurl:
                    links.append(f"[Wikipedia]({wurl})")
                if yurl:
                    links.append(f"[YouTube]({yurl})")

                if links:
                    st.markdown(" | ".join(links))
                else:
                    st.caption("No links available.")

            with col2:
                if yid:
                    st.video(f"https://www.youtube.com/watch?v={yid}")
                else:
                    st.caption("No trailer available.")

            st.divider()