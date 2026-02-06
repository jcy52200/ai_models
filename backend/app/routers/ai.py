from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from pydantic import BaseModel

from ..database import get_db
from ..models import User, AIChatSession, AIChatMessage
from ..services.ai_service import AIService
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)

# Schemas
class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):
    id: int
    session_token: str
    title: str
    created_at: str

class ChatMessageCreate(BaseModel):
    content: str
    session_token: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

# Endpoints

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    session_in: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = str(uuid.uuid4())
    new_session = AIChatSession(
        user_id=current_user.id,
        session_token=token,
        title=session_in.title
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {
        "id": new_session.id,
        "session_token": new_session.session_token,
        "title": new_session.title,
        "created_at": new_session.created_at.isoformat()
    }

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(AIChatSession).filter(AIChatSession.user_id == current_user.id).order_by(AIChatSession.last_active_at.desc()).all()
    return [
        {
            "id": s.id,
            "session_token": s.session_token,
            "title": s.title,
            "created_at": s.created_at.isoformat()
        } for s in sessions
    ]

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(AIChatSession).filter(AIChatSession.id == session_id, AIChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"status": "success"}

@router.get("/sessions/{session_token}/messages", response_model=List[ChatMessageResponse])
def get_messages(
    session_token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(AIChatSession).filter(AIChatSession.session_token == session_token, AIChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(AIChatMessage).filter(AIChatMessage.session_id == session.id).order_by(AIChatMessage.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat()
        } for m in messages
    ]

@router.post("/chat", response_model=ChatMessageResponse)
def chat(
    message_in: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify Session
    session = db.query(AIChatSession).filter(AIChatSession.session_token == message_in.session_token, AIChatSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Save User Message
    user_msg = AIChatMessage(
        session_id=session.id,
        role="user",
        content=message_in.content
    )
    db.add(user_msg)
    db.commit() # Commit to get ID and ensure it's saved

    # 3. Get History for Context
    # We fetch all messages for this session to pass to logic (or last N)
    history_objs = db.query(AIChatMessage).filter(AIChatMessage.session_id == session.id).order_by(AIChatMessage.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in history_objs]

    # 4. Call AI Service
    ai_service = AIService(db)
    response_text = ai_service.generate_response(current_user.id, history)

    # 5. Save Assistant Message
    ai_msg = AIChatMessage(
        session_id=session.id,
        role="assistant",
        content=response_text
    )
    db.add(ai_msg)
    
    # Update session last active
    session.last_active_at = ai_msg.created_at
    
    db.commit()
    db.refresh(ai_msg)

    return {
        "id": ai_msg.id,
        "role": ai_msg.role,
        "content": ai_msg.content,
        "created_at": ai_msg.created_at.isoformat()
    }
