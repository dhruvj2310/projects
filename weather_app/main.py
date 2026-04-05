from utils.utils import *

# location input from user
location = input("Location for current weather: ")

if location:
    weather = get_current_weather(location)
else:
    print("City not found")