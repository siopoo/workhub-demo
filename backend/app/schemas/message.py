from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.contact import UserBrief


class MessageCreate(BaseModel):
    receiver_id: int
    content: str = Field(min_length=1, max_length=4000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime
    is_read: bool
    sender: UserBrief
