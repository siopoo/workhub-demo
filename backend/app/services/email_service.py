from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Email, User

CURRENT_USER_ID = 1
VALID_FOLDERS = {"inbox", "sent", "drafts", "trash", "starred"}


class EmailService:
    """Local email provider boundary, replaceable by Gmail/IMAP/Graph providers later."""

    def __init__(self, session: Session):
        self.session = session

    def _with_people(self):
        return select(Email).options(joinedload(Email.sender), joinedload(Email.receiver))

    def list_emails(self, folder: str) -> list[Email]:
        normalized = folder.lower()
        if normalized not in VALID_FOLDERS:
            raise ValueError("Unknown email folder")
        statement = self._with_people()
        if normalized == "starred":
            statement = statement.where(Email.is_starred.is_(True), Email.folder != "trash")
        else:
            statement = statement.where(Email.folder == normalized)
        return list(self.session.scalars(statement.order_by(Email.created_at.desc())).all())

    def get_email(self, email_id: int) -> Email:
        email = self.session.scalar(self._with_people().where(Email.id == email_id))
        if email is None:
            raise LookupError("Email not found")
        if email.folder == "inbox" and not email.is_read:
            email.is_read = True
            self.session.commit()
            self.session.refresh(email)
        return email

    def create_email(self, to: str, subject: str, body: str, folder: str = "sent") -> Email:
        receiver = self.session.scalar(select(User).where(User.email == to.strip().lower()))
        if receiver is None:
            raise LookupError("Recipient not found")
        email = Email(
            sender_id=CURRENT_USER_ID,
            receiver_id=receiver.id,
            subject=subject.strip(),
            body=body.strip(),
            folder=folder,
            is_read=True,
        )
        self.session.add(email)
        self.session.commit()
        return self.get_email(email.id)

    def reply(self, email_id: int, body: str) -> Email:
        original = self.get_email(email_id)
        recipient = original.sender if original.sender_id != CURRENT_USER_ID else original.receiver
        subject = original.subject if original.subject.lower().startswith("re:") else f"Re: {original.subject}"
        return self.create_email(recipient.email, subject, body, "sent")

    def delete(self, email_id: int) -> None:
        email = self.session.get(Email, email_id)
        if email is None:
            raise LookupError("Email not found")
        email.folder = "trash"
        self.session.commit()


def serialize_email(email: Email) -> dict:
    compact = " ".join(email.body.split())
    preview = compact[:116] + ("…" if len(compact) > 116 else "")
    return {
        "id": email.id,
        "sender": email.sender,
        "receiver": email.receiver,
        "subject": email.subject,
        "body": email.body,
        "preview": preview,
        "folder": email.folder,
        "is_read": email.is_read,
        "is_starred": email.is_starred,
        "created_at": email.created_at,
    }
