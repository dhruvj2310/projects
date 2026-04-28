import streamlit as st
from database.queries import run_add_query

def show():
    st.title("Apply :pencil2:")

    col1, col2 = st.columns([6,4])

    with col1:
        with st.form("Student Enrollment Form", enter_to_submit=False, width="stretch"):
            firstname = st.text_input("First Name", max_chars=15, placeholder="First Name", label_visibility="collapsed")
            lastname = st.text_input("Last Name", max_chars=15, placeholder="Last Name", label_visibility="collapsed")
            clas = st.selectbox("Class", options=range(6,11), placeholder="Class", label_visibility="collapsed",index=None)
            raw = st.text_input(label="Percentage",max_chars=6, label_visibility="collapsed", placeholder="Percentage")
            school = st.text_input("School", label_visibility="collapsed", max_chars=50, placeholder="School")

            # --- validation ---
            value = None

            if raw:
                try:
                    value = float(raw)
                    if not (0 <= value <= 100):
                        st.error("Value must be between 0 and 100.")
                        value = None
                    elif len(raw.split(".")[-1]) > 2 if "." in raw else False:
                        st.error("Maximum 2 decimal places allowed.")
                        value = None
                except ValueError:
                    st.error("Please enter a valid number")
                    value = None



            submitted = st.form_submit_button("Submit")
            if submitted:
                run_add_query(firstname, lastname, clas, float(raw), school)