import streamlit as st
from utils.utils import get_current_weather

st.set_page_config(page_title="Check your weather", layout="wide")
st.title("Check your weather")

city = st.text_area(label="Your City:")

run = st.button("Check my weather")

if run:
    weather = get_current_weather(city)
    st.write(weather)