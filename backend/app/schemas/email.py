from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.contact import UserBrief


class EmailCreate(BaseModel):
    to: str = Field(min_length=3, max_length=180)
    subject: str = Field(min_length=1, max_length=220)
    body: str = Field(min_length=1)
    folder: Literal["sent", "drafts"] = "sent"


class EmailReply(BaseModel):
    body: str = Field(min_length=1)


class EmailRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender: UserBrief
    receiver: UserBrief
    subject: str
    body: str
    preview: str
    folder: str
    is_read: bool
    is_starred: bool
    created_at: datetime
