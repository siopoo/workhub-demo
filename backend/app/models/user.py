from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    job_title: Mapped[str] = mapped_column(String(120))
    avatar: Mapped[str] = mapped_column(String(12))
    status: Mapped[str] = mapped_column(String(24), default="offline")

    sent_messages: Mapped[List["Message"]] = relationship(  # noqa: F821
        foreign_keys="Message.sender_id", back_populates="sender"
    )
    received_messages: Mapped[List["Message"]] = relationship(  # noqa: F821
        foreign_keys="Message.receiver_id", back_populates="receiver"
    )
