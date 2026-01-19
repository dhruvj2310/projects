import requests, json
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY")
api_url = os.getenv("API_URL")

def get_current_weather(city):
    """
    Get current weather data using latitude and longitude
    """

    response = requests.get(f"{api_url}?key={api_key}&q={city}&api=no")

    if response.status_code != 200:
        raise Exception(f"Weather API error: {response.status_code}")

    json_out = response.json()
    data = json_out["current"]
    summary = (
        f"\n\nAs on {data['last_updated']}, the current weather in {city} is \n{data['condition']['text'].lower()} with a temperature of \n{data['temp_c']}°C ({data['temp_f']}°F). \n\nIt feels like {data['feelslike_c']}°C, with humidity at {data['humidity']}% \nand wind blowing {data['wind_dir']} at {data['wind_kph']} km/h.\n\n"
    )
    return summary