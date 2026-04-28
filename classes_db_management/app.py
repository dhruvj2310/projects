from libs.logger import get_logger
get_logger()

import logging

logger = logging.getLogger(__name__)

import streamlit as st
from tabs import home, academics, faculty, about_us, apply

st.set_page_config(page_title="Ace Academics", page_icon="/Users/dhruv/Documents/projects/automation/db_management/assets/pngwing.com.png", layout="wide")
st.title("Ace Academics :books:")

tab_names = ["Home", "Academics", "Faculty", "About Us", "Apply"]
tab_modules = [home, academics, faculty, about_us, apply]

tabs = st.tabs(tab_names)

for tab, module in zip(tabs, tab_modules):
    with tab:
        module.show()