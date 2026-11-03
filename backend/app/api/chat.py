import json
import time
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_optional_user
from app.models.models import User, Conversation, Message, DocumentChunk, KnowledgeDocument, AnalyticsEvent
from app.schemas.schemas import ChatQueryRequest, MessageOut, MainsEvaluationRequest, MCQGenerateRequest
from app.services.ai_service import (
    generate_chat_response_stream,
    evaluate_mains_answer,
    generate_mcqs
)
from app.services.rag_service import generate_embedding, compute_cosine_similarity

router = APIRouter(prefix="/chat", tags=["Chat & AI Operations"])

# Sliding-window rate limiter per client
_RATE_LIMIT_STORE: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW = 60.0  # seconds
MAX_REQUESTS_PER_WINDOW = 40  # requests per minute

def check_rate_limit(client_id: str):
    now = time.time()
    timestamps = _RATE_LIMIT_STORE.get(client_id, [])
    timestamps = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(timestamps) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before sending more messages."
        )
    timestamps.append(now)
    _RATE_LIMIT_STORE[client_id] = timestamps

def retrieve_grounded_chunks(query: str, db: Session, top_k: int = 3) -> List[Dict[str, Any]]:
    """Retrieves top-K most similar document chunks from the vector repository."""
    query_emb = generate_embedding(query)
    chunks = db.query(DocumentChunk).all()
    if not chunks:
        return []

    scored_chunks = []
    for c in chunks:
        if c.embedding:
            score = compute_cosine_similarity(query_emb, c.embedding)
            if score >= 0.25:  # Relevance cutoff
                doc_title = "Official Institute Document"
                if c.document:
                    doc_title = c.document.title
                scored_chunks.append({
                    "score": score,
                    "doc_title": doc_title,
                    "page_number": c.page_number,
                    "text": c.chunk_text
                })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]

@router.post("/stream")
def stream_chat(
    req: ChatQueryRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Server-Sent Events (SSE) streaming endpoint for AI Chatbot responses.
    Streams tokens in real time, sends source citations, and persists conversation.
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_key = current_user.id if current_user else client_ip
    check_rate_limit(rate_key)

    start_time = time.time()

    # 1. Resolve or create user & conversation
    user_id = current_user.id if current_user else "anonymous-aspirant"
    conv_id = req.conversation_id
    conversation = None

    if conv_id and current_user:
        conversation = db.query(Conversation).filter(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id
        ).first()

    if not conversation and current_user:
        title_snippet = req.message[:45] + ("..." if len(req.message) > 45 else "")
        conversation = Conversation(user_id=current_user.id, title=title_snippet)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conv_id = conversation.id

    # 2. Retrieve grounded context via RAG
    retrieved_chunks = []
    citations = []
    if req.use_rag:
        retrieved_chunks = retrieve_grounded_chunks(req.message, db, top_k=settings.TOP_K_RETRIEVAL)
        for rc in retrieved_chunks:
            citations.append({
                "document_title": rc["doc_title"],
                "page_number": rc["page_number"],
                "snippet": rc["text"][:180] + "..."
            })

    # 3. Retrieve conversation history if available (configurable limit)
    history = []
    if conversation:
        past_msgs = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(settings.MAX_HISTORY_MESSAGES).all()
        for pm in reversed(past_msgs):
            history.append({"role": pm.role, "content": pm.content})

    def event_generator():
        full_content = []
        try:
            # First send citations event if available
            if citations:
                yield f"event: citations\ndata: {json.dumps(citations)}\n\n"

            # Stream tokens
            token_stream = generate_chat_response_stream(
                query=req.message,
                conversation_history=history,
                retrieved_chunks=retrieved_chunks,
                subject=req.subject_filter,
                language=req.language_override or (current_user.preferred_language if current_user else None)
            )

            for token in token_stream:
                full_content.append(token)
                chunk_data = json.dumps({"text": token})
                yield f"event: token\ndata: {chunk_data}\n\n"

            final_text = "".join(full_content)
            
            # Persist messages in database if user is authenticated
            msg_id = None
            if conversation:
                # User message
                user_msg = Message(
                    conversation_id=conversation.id,
                    role="user",
                    content=req.message,
                    citations=[]
                )
                db.add(user_msg)

                # Assistant message
                asst_msg = Message(
                    conversation_id=conversation.id,
                    role="assistant",
                    content=final_text,
                    citations=citations
                )
                db.add(asst_msg)
                conversation.updated_at = datetime.datetime.utcnow()
                db.commit()
                db.refresh(asst_msg)
                msg_id = asst_msg.id

            # Send done event
            done_payload = json.dumps({
                "status": "complete",
                "conversation_id": conv_id,
                "message_id": msg_id
            })
            yield f"event: done\ndata: {done_payload}\n\n"

            # Log latency analytics
            latency = (time.time() - start_time) * 1000
            db.add(AnalyticsEvent(
                event_type="chat_stream",
                latency_ms=latency,
                status_code=200
            ))
            db.commit()

        except Exception as e:
            err_data = json.dumps({"error": str(e)})
            yield f"event: error\ndata: {err_data}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("", response_model=Dict[str, Any])
def non_streaming_chat(
    req: ChatQueryRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Standard non-streaming chat endpoint with validation and rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = current_user.id if current_user else client_ip
    check_rate_limit(rate_key)

    conv_id = req.conversation_id
    conversation = None

    if conv_id and current_user:
        conversation = db.query(Conversation).filter(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id
        ).first()

    if not conversation and current_user:
        title_snippet = req.message[:45] + ("..." if len(req.message) > 45 else "")
        conversation = Conversation(user_id=current_user.id, title=title_snippet)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conv_id = conversation.id

    history = []
    if conversation:
        past_msgs = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(settings.MAX_HISTORY_MESSAGES).all()
        for pm in reversed(past_msgs):
            history.append({"role": pm.role, "content": pm.content})

    retrieved_chunks = retrieve_grounded_chunks(req.message, db) if req.use_rag else []
    citations = [
        {"document_title": c["doc_title"], "page_number": c["page_number"], "snippet": c["text"][:150]}
        for c in retrieved_chunks
    ]
    
    tokens = list(generate_chat_response_stream(
        query=req.message,
        conversation_history=history,
        retrieved_chunks=retrieved_chunks,
        subject=req.subject_filter,
        language=req.language_override or (current_user.preferred_language if current_user else None)
    ))
    final_text = "".join(tokens)

    if conversation:
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=req.message,
            citations=[]
        )
        db.add(user_msg)

        asst_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=final_text,
            citations=citations
        )
        db.add(asst_msg)
        conversation.updated_at = datetime.datetime.utcnow()
        db.commit()

    return {
        "response": final_text,
        "citations": citations,
        "conversation_id": conv_id
    }

@router.post("/evaluate-mains")
def evaluate_student_answer(
    req: MainsEvaluationRequest,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Evaluates a written Mains answer against UPSC standard rubric."""
    evaluation = evaluate_mains_answer(
        question=req.question,
        user_answer=req.user_answer,
        marks=req.marks
    )
    return evaluation

@router.post("/generate-mcqs")
def generate_prelims_mcqs(
    req: MCQGenerateRequest,
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Generates standard UPSC Prelims MCQs with 4 options and elimination reasoning."""
    mcqs = generate_mcqs(
        topic=req.topic,
        subject=req.subject,
        count=req.count,
        difficulty=req.difficulty
    )
    return {"mcqs": mcqs}
