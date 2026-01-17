from utils.utils import *

location = input("Location for current weather: ")

if location:
    weather = get_current_weather(location)
    print(weather)
else:
    print("City not found")