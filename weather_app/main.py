from utils.utils import *

location = input("Location for current weather: ")
print(location)

if location:
    get_lat_lon(location)