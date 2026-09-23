from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents import EnterpriseAssistant
from app.database import get_db
from app.schemas import AgentRequest, AgentResponse
from app.services.email_service import EmailService
from app.services.message_service import MessageService
from app.skills import EnterpriseSkills

router = APIRouter(prefix="/api/agent", tags=["agent"])
assistant = EnterpriseAssistant()


@router.post("/chat", response_model=AgentResponse)
def chat_with_agent(payload: AgentRequest, db: Session = Depends(get_db)):
    skills = EnterpriseSkills(
        messages=MessageService(db),
        emails=EmailService(db),
    )
    try:
        return assistant.run(payload.message, skills)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
