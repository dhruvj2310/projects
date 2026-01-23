import pandas as pd

def clean_q(text):
    clean_query = text.replace(" ", "+")
    return clean_query

def results_dataframe(resp_json):
    results = resp_json.get("similar", {}).get("results", [])
    df = pd.DataFrame(results)
    return df