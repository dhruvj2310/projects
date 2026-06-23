from openrouter import OpenRouter
from dotenv import load_dotenv
import os


load_dotenv()

def api_call(q: str):
  with OpenRouter(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    ) as client:
    response = client.chat.send(
        model="cohere/north-mini-code:free",
        messages=[
        {
            "role": "user",
            "content": q
        }
        ]
    )

    return response.choices[0].message.content