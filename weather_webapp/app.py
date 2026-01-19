import streamlit as st
from utils.utils import get_current_weather

st.set_page_config(page_title="Check your weather", layout="wide")
st.title("Check your weather")

# take input from user
city = st.text_area(label="Your City:")

# create run button and define it's function
run = st.button("Check my weather")

if run:
    weather = get_current_weather(city)
    st.write(weather)