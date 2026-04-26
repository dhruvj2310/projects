with open("file_name") as f:
    lines = f.read().splitlines()

headers = lines[0].split(",")
data = []

for j, line in enumerate(lines[1:], start=1):
    values = line.split(",")
    entry = "{"+f'"id": "{j}", '+", ".join(f'"{headers[i]}": "{values[i]}"' for i in range(len(headers))) + "}"
    data.append(entry)

json_output = "[\n    " + ",\n    ".join(data) + "\n]"

with open("names.json", "w") as f:
    f.write(json_output)
