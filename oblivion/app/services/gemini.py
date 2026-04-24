from google import genai
from google.genai import types

from app.core.config import settings

# 1. Initialize the new centralized Client once
client = genai.Client(api_key=settings.gemini_api_key)


async def get_ai_response(history: list, new_content: str) -> str:
    """Initializes chat with the specific branch history and gets the next response."""

    # 2. Map our generic history dicts into the new SDK's strict typed models
    formatted_history: list[types.Content | types.ContentDict] = []
    for msg in history:
        # Extract the string content we passed from chat_service.py
        content_text = msg["parts"][0]

        # Build the exact Content and Part objects the new SDK expects
        formatted_history.append(
            types.Content(role=msg["role"], parts=[types.Part.from_text(text=content_text)])
        )

    # 3. Create the chat session using the async client wrapper (`client.aio`)
    chat = client.aio.chats.create(model=settings.ai_model_name, history=formatted_history)

    # 4. Await the response
    response = await chat.send_message(new_content)
    return response.text or ""
