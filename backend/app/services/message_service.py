from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models import Message, User

CURRENT_USER_ID = 1


class MessageService:
    def __init__(self, session: Session):
        self.session = session

    def list_contacts(self) -> list[dict]:
        contacts = self.session.scalars(
            select(User).where(User.id != CURRENT_USER_ID).order_by(User.id)
        ).all()
        result: list[dict] = []
        for contact in contacts:
            conversation_filter = or_(
                and_(Message.sender_id == CURRENT_USER_ID, Message.receiver_id == contact.id),
                and_(Message.sender_id == contact.id, Message.receiver_id == CURRENT_USER_ID),
            )
            last_message = self.session.scalar(
                select(Message)
                .where(conversation_filter)
                .order_by(Message.created_at.desc())
                .limit(1)
            )
            unread = self.session.scalar(
                select(func.count(Message.id))
                .where(
                    Message.sender_id == contact.id,
                    Message.receiver_id == CURRENT_USER_ID,
                    Message.is_read.is_(False),
                )
            ) or 0
            result.append(
                {
                    "id": contact.id,
                    "name": contact.name,
                    "email": contact.email,
                    "job_title": contact.job_title,
                    "avatar": contact.avatar,
                    "status": contact.status,
                    "last_message": last_message.content if last_message else None,
                    "last_message_at": last_message.created_at if last_message else None,
                    "unread_count": unread,
                }
            )
        return result

    def get_conversation(self, contact_id: int) -> list[Message]:
        contact = self.session.get(User, contact_id)
        if contact is None or contact_id == CURRENT_USER_ID:
            raise LookupError("Contact not found")
        incoming = self.session.scalars(
            select(Message).where(
                Message.sender_id == contact_id,
                Message.receiver_id == CURRENT_USER_ID,
                Message.is_read.is_(False),
            )
        ).all()
        for message in incoming:
            message.is_read = True
        self.session.commit()
        return list(
            self.session.scalars(
                select(Message)
                .options(joinedload(Message.sender))
                .where(
                    or_(
                        and_(
                            Message.sender_id == CURRENT_USER_ID,
                            Message.receiver_id == contact_id,
                        ),
                        and_(
                            Message.sender_id == contact_id,
                            Message.receiver_id == CURRENT_USER_ID,
                        ),
                    )
                )
                .order_by(Message.created_at)
            ).all()
        )

    def send_message(self, receiver_id: int, content: str) -> Message:
        receiver = self.session.get(User, receiver_id)
        if receiver is None or receiver_id == CURRENT_USER_ID:
            raise LookupError("Receiver not found")
        message = Message(
            sender_id=CURRENT_USER_ID,
            receiver_id=receiver_id,
            content=content.strip(),
            is_read=True,
        )
        self.session.add(message)
        self.session.commit()
        return self.session.scalar(
            select(Message).options(joinedload(Message.sender)).where(Message.id == message.id)
        )
