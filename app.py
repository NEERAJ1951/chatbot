import os
import streamlit as st
from google import genai
from google.genai import types

# Load .env file automatically if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ----------------- Page Configuration -----------------
st.set_page_config(
    page_title="AntiGravity IAS Mentor | Gravitas",
    page_icon="🏛️",
    layout="wide"
)

# ----------------- System Instruction -----------------
SYSTEM_INSTRUCTION = """# Role & Identity
You are "Gravitas", the Chief AI Academic Mentor & Guidance Bot for "AntiGravity IAS Academy" (a premier UPSC Civil Services Examination preparation institute). Your objective is to assist aspirants with syllabus coverage, conceptual clarity, Mains answer structuring, Prelims problem-solving, and preparation strategy.

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

# ----------------- Client Initialization -----------------
# Check environment variable or st.secrets
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key and hasattr(st, "secrets") and "GEMINI_API_KEY" in st.secrets:
    api_key = st.secrets["GEMINI_API_KEY"]

# Sidebar for controls & API key configuration
with st.sidebar:
    st.title("🏛️ AntiGravity IAS")
    st.markdown("*Premier Civil Services Preparation*")
    st.divider()

    # If API key not in environment or secrets, allow entering in sidebar
    if not api_key:
        api_key_input = st.text_input(
            "Enter Gemini API Key",
            type="password",
            placeholder="AIzaSy...",
            help="Get your free key from Google AI Studio (https://aistudio.google.com/)"
        )
        if api_key_input:
            api_key = api_key_input
            os.environ["GEMINI_API_KEY"] = api_key
            st.success("API Key set successfully!")

    st.markdown("""
    ### 📚 Syllabus Mapping:
    - **GS 1:** History, Geography, Indian Society
    - **GS 2:** Polity, Governance, IR, Social Justice
    - **GS 3:** Economy, Env, Sci-Tech, Security
    - **GS 4:** Ethics, Integrity & Aptitude
    - **Essay & Prelims Strategy**
    """)
    st.divider()

    if st.button("🔄 Reset Chat Session", use_container_width=True):
        st.session_state.messages = [
            {"role": "assistant", "content": "Namaste! Main **Gravitas** hoon, AntiGravity IAS Academy ka Chief AI Academic Mentor. UPSC Prelims concept, Mains answer-writing structure, ya preparation strategy se juda koi bhi sawal poochiye."}
        ]
        if "chat_session" in st.session_state:
            del st.session_state["chat_session"]
        st.rerun()

    st.caption("AntiGravity IAS Academy • Academic Mentorship Cell")

# Stop if no API key is available
if not api_key:
    st.warning("⚠️ **GEMINI_API_KEY is required to continue.**")
    st.info("""
    You can set it in any of the following ways:
    1. Enter it in the **Sidebar** on the left.
    2. Add `GEMINI_API_KEY=your_key` in a `.env` file in this directory.
    3. Run in PowerShell: `$env:GEMINI_API_KEY="your_key"` before starting the app.
    """)
    st.stop()

@st.cache_resource
def get_client(key: str):
    return genai.Client(api_key=key)

client = get_client(api_key)

# ----------------- Session State for Chat -----------------
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Namaste! Main **Gravitas** hoon, AntiGravity IAS Academy ka Chief AI Academic Mentor. UPSC Prelims, Mains answer-writing, ya preparation strategy se juda koi bhi sawal poochiye."}
    ]

# Stateful chat session for Gemini API
if "chat_session" not in st.session_state:
    st.session_state.chat_session = client.chats.create(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            temperature=0.3,
            max_output_tokens=2048,
        )
    )

# ----------------- UI Header -----------------
st.title("🏛️ AntiGravity IAS Mentor — Gravitas")
st.caption("Chief AI Academic Mentor & Guidance Bot | UPSC Civil Services Examination")

# ----------------- Render Chat History -----------------
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# ----------------- User Input & Streaming Response -----------------
if prompt := st.chat_input("Apna UPSC sawal yahan likhein (e.g., 'Analyze the challenges in cooperative federalism under GS-2')..."):
    # Display user query
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Stream bot response
    with st.chat_message("assistant"):
        response_placeholder = st.empty()
        full_response = ""
        
        try:
            response_stream = st.session_state.chat_session.send_message_stream(prompt)
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    response_placeholder.markdown(full_response + "▌")
            
            response_placeholder.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})
            
        except Exception as e:
            st.error(f"Error during response generation: {e}")
