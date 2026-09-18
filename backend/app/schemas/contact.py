from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    job_title: Optional[str] = None
    avatar: Optional[str] = None
    status: Optional[str] = None


class ContactRead(UserBrief):
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
