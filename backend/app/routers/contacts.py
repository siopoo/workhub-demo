from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ContactRead
from app.services.message_service import MessageService

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


@router.get("", response_model=list[ContactRead])
def list_contacts(db: Session = Depends(get_db)):
    return MessageService(db).list_contacts()
