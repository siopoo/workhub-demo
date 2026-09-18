from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import EmailCreate, EmailRead, EmailReply
from app.services.email_service import EmailService, serialize_email

router = APIRouter(prefix="/api/emails", tags=["emails"])


@router.get("", response_model=list[EmailRead])
def list_emails(folder: str = "inbox", db: Session = Depends(get_db)):
    try:
        return [serialize_email(email) for email in EmailService(db).list_emails(folder)]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{email_id}", response_model=EmailRead)
def get_email(email_id: int, db: Session = Depends(get_db)):
    try:
        return serialize_email(EmailService(db).get_email(email_id))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("", response_model=EmailRead, status_code=status.HTTP_201_CREATED)
def create_email(payload: EmailCreate, db: Session = Depends(get_db)):
    try:
        email = EmailService(db).create_email(
            payload.to, payload.subject, payload.body, payload.folder
        )
        return serialize_email(email)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{email_id}/reply", response_model=EmailRead, status_code=status.HTTP_201_CREATED)
def reply_to_email(email_id: int, payload: EmailReply, db: Session = Depends(get_db)):
    try:
        return serialize_email(EmailService(db).reply(email_id, payload.body))
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{email_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_email(email_id: int, db: Session = Depends(get_db)):
    try:
        EmailService(db).delete(email_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
