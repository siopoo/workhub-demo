from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def make_client(tmp_path: Path) -> TestClient:
    database_url = f"sqlite:///{tmp_path / 'workhub-test.db'}"
    return TestClient(create_app(database_url=database_url))


def test_seeded_contacts_include_amanda_with_conversation_summary(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/contacts")

    assert response.status_code == 200
    contacts = response.json()
    assert len(contacts) == 5
    amanda = next(contact for contact in contacts if contact["name"] == "Amanda Johnson")
    assert amanda["job_title"] == "HR Manager"
    assert amanda["last_message"]
    assert isinstance(amanda["unread_count"], int)


def test_sent_message_is_persisted_in_conversation(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        contacts = client.get("/api/contacts").json()
        amanda = next(contact for contact in contacts if contact["name"] == "Amanda Johnson")
        payload = {
            "receiver_id": amanda["id"],
            "content": "Hi Amanda, I have finished the demo. Could you take a look?",
        }

        created = client.post("/api/messages", json=payload)
        conversation = client.get(f"/api/conversations/{amanda['id']}")

    assert created.status_code == 201
    assert conversation.status_code == 200
    assert conversation.json()[-1]["content"] == payload["content"]
    assert conversation.json()[-1]["sender"]["name"] == "Peng Ma"


def test_inbox_contains_project_meeting_and_opening_marks_it_read(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        inbox = client.get("/api/emails", params={"folder": "inbox"})
        project_meeting = next(
            email for email in inbox.json() if email["subject"] == "Project Meeting"
        )
        opened = client.get(f"/api/emails/{project_meeting['id']}")
        refreshed = client.get("/api/emails", params={"folder": "inbox"})

    assert inbox.status_code == 200
    assert opened.status_code == 200
    assert opened.json()["body"]
    refreshed_email = next(
        email for email in refreshed.json() if email["id"] == project_meeting["id"]
    )
    assert refreshed_email["is_read"] is True


def test_reply_creates_a_sent_email(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        project_meeting = next(
            email
            for email in client.get("/api/emails", params={"folder": "inbox"}).json()
            if email["subject"] == "Project Meeting"
        )
        reply = client.post(
            f"/api/emails/{project_meeting['id']}/reply",
            json={"body": "Monday afternoon works for me. Thanks!"},
        )
        sent = client.get("/api/emails", params={"folder": "sent"})

    assert reply.status_code == 201
    assert reply.json()["subject"] == "Re: Project Meeting"
    assert any(
        email["id"] == reply.json()["id"] and email["folder"] == "sent"
        for email in sent.json()
    )


def test_compose_and_delete_email_update_mailboxes(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        created = client.post(
            "/api/emails",
            json={
                "to": "john@workhub.demo",
                "subject": "Demo Project",
                "body": "Hi John,\n\nI have completed the first version of the WorkHub demo.\n\nBest regards,\nPeng",
            },
        )
        sent = client.get("/api/emails", params={"folder": "sent"})
        deleted = client.delete(f"/api/emails/{created.json()['id']}")
        trash = client.get("/api/emails", params={"folder": "trash"})

    assert created.status_code == 201
    assert any(email["id"] == created.json()["id"] for email in sent.json())
    assert deleted.status_code == 204
    assert any(email["id"] == created.json()["id"] for email in trash.json())
