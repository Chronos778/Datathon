from __future__ import annotations

import sys

from app.config import gemini_api_keys, gemini_model


def main() -> int:
    api_keys = gemini_api_keys()
    model = gemini_model()
    if not api_keys:
        print("ERROR: GEMINI_API_KEY is missing or empty.")
        return 1

    try:
        from google import genai
    except ImportError as error:
        print(f"ERROR: google-genai SDK is not installed: {error}")
        return 1

    print(f"Testing Gemini model: {model}")
    print("Sending exactly one request...")
    try:
        client = genai.Client(api_key=api_keys[0])
        response = client.models.generate_content(
            model=model,
            contents="Reply with exactly: Gemini API test successful",
        )
        print("SUCCESS")
        print(f"Response: {str(response.text or '').strip()}")
        return 0
    except Exception as error:
        print(f"FAILED: {type(error).__name__}")
        print(f"Message: {error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
