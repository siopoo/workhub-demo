from dataclasses import dataclass
from typing import Any, Callable

from app.services.email_service import EmailService
from app.services.message_service import MessageService


@dataclass
class EnterpriseSkills:
    """Expose existing WorkHub services as small, observable AI skills."""

    messages: MessageService
    emails: EmailService

    def execute(self, name: str, arguments: dict[str, Any]) -> dict:
        handlers: dict[str, Callable[[dict[str, Any]], dict]] = {
            "search_messages": self._search_messages,
            "search_emails": self._search_emails,
            "summarize_messages": self._summarize_messages,
        }
        if name not in handlers:
            raise ValueError(f"Unknown WorkHub skill: {name}")
        return handlers[name](arguments)

    def _search_messages(self, arguments: dict[str, Any]) -> dict:
        results = self.messages.search_messages(str(arguments["query"]))
        return {"count": len(results), "messages": results}

    def _search_emails(self, arguments: dict[str, Any]) -> dict:
        emails = self.emails.search_emails(str(arguments["query"]))
        results = [
            {
                "id": email.id,
                "subject": email.subject,
                "sender": email.sender.name,
                "body": email.body,
                "created_at": email.created_at.isoformat(),
            }
            for email in emails
        ]
        return {"count": len(results), "emails": results}

    def _summarize_messages(self, arguments: dict[str, Any]) -> dict:
        messages = list(arguments.get("messages", []))
        if not messages:
            return {"summary": "No matching chat messages were found."}
        details = " ".join(
            f"{message['sender']}: {message['content']}" for message in messages
        )
        return {
            "summary": f"Found {len(messages)} matching chat message(s). {details}"
        }
