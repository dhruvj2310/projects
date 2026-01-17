import requests, json
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY")
api_url = os.getenv("API_URL")
geo_url = os.getenv("GEO_URL")
zip_url = os.getenv("ZIP_URL")

def get_lat_lon(city):
    params = {
        "q": city,
        "limit": 1,
        "appid": api_key
    }

    response = requests.get(geo_url, params=params)

    if response.status_code != 200:
        raise Exception(f"API error: {response.status_code}")

    data = response.json()

    if not data:
        return None

    lat = data[0]["lat"]
    lon = data[0]["lon"]

    return lat, lon

# def get_