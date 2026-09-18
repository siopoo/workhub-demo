from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import MessageCreate, MessageRead
from app.services.message_service import MessageService

router = APIRouter(prefix="/api", tags=["messages"])


@router.get("/conversations/{contact_id}", response_model=list[MessageRead])
def get_conversation(contact_id: int, db: Session = Depends(get_db)):
    try:
        return MessageService(db).get_conversation(contact_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/messages", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def send_message(payload: MessageCreate, db: Session = Depends(get_db)):
    try:
        return MessageService(db).send_message(payload.receiver_id, payload.content)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
