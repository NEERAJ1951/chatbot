import os
import re
import math
from typing import List, Dict, Any, Tuple, Optional
import fitz  # PyMuPDF
from app.core.config import settings

def sanitize_text(text: str) -> str:
    """Protects against prompt injection and cleans text."""
    if not text:
        return ""
    # Strip potential prompt injection triggers
    patterns = [
        r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
        r"(?i)you\s+are\s+now\s+in\s+developer\s+mode",
        r"(?i)system\s*:\s*",
        r"(?i)<\s*system\s*>",
        r"(?i)disregard\s+system\s+prompt",
        r"(?i)bypass\s+safety\s+filter",
        r"(?i)reveal\s+(your\s+)?(system\s+)?prompt"
    ]
    cleaned = text
    for p in patterns:
        cleaned = re.sub(p, "[REDACTED_SECURITY_RISK]", cleaned)
    
    # Normalize excess whitespace
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()

def chunk_text_with_overlap(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Splits text into chunks with specified character size and overlap."""
    if not text:
        return []
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0

    for word in words:
        current_chunk.append(word)
        current_length += len(word) + 1
        if current_length >= chunk_size:
            chunk_str = " ".join(current_chunk)
            chunks.append(chunk_str)
            # Retain overlap words
            overlap_words = []
            overlap_len = 0
            for w in reversed(current_chunk):
                overlap_words.insert(0, w)
                overlap_len += len(w) + 1
                if overlap_len >= overlap:
                    break
            current_chunk = overlap_words
            current_length = overlap_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def extract_text_from_file(file_path: str, doc_type: str) -> List[Dict[str, Any]]:
    """
    Extracts text page by page preserving metadata and page numbers.
    Returns: List of dicts: [{'page_number': 1, 'text': '...'}]
    """
    pages_data = []
    doc_type = doc_type.upper()

    if doc_type == "PDF":
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                cleaned = sanitize_text(text)
                if cleaned:
                    pages_data.append({
                        "page_number": page_num + 1,
                        "text": cleaned
                    })
            doc.close()
        except Exception as e:
            print(f"[RAG Extract Error]: PDF parsing error {e}")
    elif doc_type in ("TXT", "MD"):
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                cleaned = sanitize_text(content)
                if cleaned:
                    pages_data.append({
                        "page_number": 1,
                        "text": cleaned
                    })
        except Exception as e:
            print(f"[RAG Extract Error]: Text file error {e}")
    elif doc_type == "DOCX":
        # Basic text fallback for docx
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(file_path) as docx:
                xml_content = docx.read('word/document.xml')
                tree = ET.fromstring(xml_content)
                texts = [elem.text for elem in tree.iter() if elem.text]
                full_text = " ".join(texts)
                cleaned = sanitize_text(full_text)
                if cleaned:
                    pages_data.append({"page_number": 1, "text": cleaned})
        except Exception as e:
            print(f"[RAG Extract Error]: DOCX parsing fallback error {e}")

    return pages_data

def compute_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculates cosine similarity between two float vectors."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot_prod = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a * a for a in vec1))
    mag2 = math.sqrt(sum(b * b for b in vec2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_prod / (mag1 * mag2)

def generate_embedding(text: str) -> List[float]:
    """
    Generates embedding using Gemini API if key is available,
    or falls back to high-dimensional deterministic hash embedding.
    """
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            result = client.models.embed_content(
                model=settings.EMBEDDING_MODEL,
                contents=text[:2000]
            )
            if hasattr(result, "embeddings") and result.embeddings:
                return result.embeddings[0].values
        except Exception as e:
            # Fallback to local heuristic vector
            pass

    # Deterministic semantic-space projection (dim=128)
    vector = [0.0] * 128
    words = re.findall(r"\w+", text.lower())
    for w in words:
        h = hash(w) % 128
        vector[h] += 1.0
    # Normalize
    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [x / norm for x in vector]

def process_and_chunk_document(file_path: str, doc_type: str) -> List[Dict[str, Any]]:
    """Processes document, extracts text per page, chunks it, and generates embeddings."""
    pages = extract_text_from_file(file_path, doc_type)
    all_chunks = []

    for page in pages:
        p_num = page["page_number"]
        chunks = chunk_text_with_overlap(page["text"], settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        for idx, chunk in enumerate(chunks):
            embedding = generate_embedding(chunk)
            all_chunks.append({
                "page_number": p_num,
                "chunk_text": chunk,
                "embedding": embedding,
                "metadata": {"chunk_index": idx, "doc_type": doc_type}
            })

    return all_chunks
