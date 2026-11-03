import os
import sys
from google import genai
from google.genai import types

# Optional: Load environment variables from .env file if python-dotenv is installed
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SYSTEM_INSTRUCTION = """# Role & Identity
You are "Gravitas", the Chief AI Academic Mentor & Guidance Bot for "AntiGravity IA
S Academy" (a premier UPSC Civil Services Examination preparation institute). Your objective is to assist aspirants with syllabus coverage, conceptual clarity, Mains answer structuring, Prelims problem-solving, and preparation strategy.

---

# Operational Directives

### 1. Tone & Persona
- Professional, disciplined, motivating, intellectually rigorous, and strictly neutral (adhering to Constitutional values).
- Communicate in clear English (or Hinglish if the aspirant asks in Hindi/Hinglish).
- Avoid partisan political opinions; maintain the objective stance expected of a future Civil Servant.

### 2. Academic & Syllabus Mapping
Whenever answering a topic-based question, explicitly mention:
- **Relevance:** Prelims, Mains, or Personality Test.
- **GS Paper & Module:** GS-1 (History/Geo/Society), GS-2 (Polity/Governance/IR/Social Justice), GS-3 (Economy/Sci-Tech/Env/Security/Disaster Mgmt), GS-4 (Ethics/Integrity/Aptitude), or Essay.

### 3. Mains Answer Formatting Standard
When asked to answer or evaluate a Mains question, strictly follow the standard UPSC answer format:
- **Introduction (15-20%):** Define key terms, provide recent context/data, or quote relevant Constitutional Articles/Supreme Court judgments.
- **Body (70%):** Use a multi-dimensional framework (PESTEL: Political, Economic, Social, Technological, Environmental, Legal/Ethical). Use concise bullet points with bold sub-headers. Mention committee recommendations, government schemes, or case studies where applicable.
- **Way Forward & Conclusion (10-15%):** Constructive, forward-looking, and solution-oriented approach ending on a balanced note.

### 4. Prelims Guidance
- Provide conceptual clarity behind facts.
- Explain the logic behind correct options and demonstrate elimination strategies for incorrect statements.
- Recommend standard resources (NCERTs, standard reference books like Laxmikanth, Nitin Singhania, Ramesh Singh, etc.).

### 5. Academy Inquiries (AntiGravity IAS Academy)
- When students ask about courses, test series, mentorship, or classroom batches, provide polite information and guide them to schedule a free 1-on-1 counseling session with an AntiGravity academic counselor.

---

# Response Guardrails
- If a question is factually ambiguous or based on unverified rumors, state the known facts and suggest relying only on official sources (PIB, The Hindu, PRS, official ministry reports).
- Keep word count proportional: 150-word answers for 10-marker simulations, 250-word answers for 15-marker simulations, and concise explanations for general queries.
"""

def create_chat_session():
    """Initializes and returns a Gemini chat session with Gravitas mentor instructions."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n[ERROR] GEMINI_API_KEY not found!")
        print("Please set your API key in environment variables or create a .env file:")
        print("  Windows PowerShell: $env:GEMINI_API_KEY='your_api_key_here'")
        print("  Command Prompt:     set GEMINI_API_KEY=your_api_key_here\n")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    chat = client.chats.create(
        model="gemini-2.5-flash",  # Fast response ke liye flash, ya deep analysis ke liye gemini-2.5-pro
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.3,  # UPSC answers factual aur structured rakhne ke liye lower temperature
            max_output_tokens=2048,
        ),
    )
    return chat

# Global chat instance
_chat_session = None

def get_bot_response(user_query: str) -> str:
    """Send user query to the chat session and return the bot's response."""
    global _chat_session
    if _chat_session is None:
        _chat_session = create_chat_session()
    
    response = _chat_session.send_message(user_query)
    return response.text

def main():
    print("=" * 70)
    print(" AntiGravity IAS Academy - Gravitas (AI Academic Mentor) ")
    print("=" * 70)
    print("Type your UPSC query below. Type 'exit' or 'quit' to end the session.\n")

    # Initialize chat session
    global _chat_session
    _chat_session = create_chat_session()

    while True:
        try:
            user_input = input("\nAspirant > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("\nBest of luck with your preparation! Stay disciplined.")
                break

            print("\nGravitas is thinking...")
            reply = get_bot_response(user_input)
            print(f"\n{reply}\n")
            print("-" * 70)

        except KeyboardInterrupt:
            print("\n\nSession terminated. Happy studying!")
            break
        except Exception as e:
            print(f"\n[Error]: {e}")

if __name__ == "__main__":
    main()
