from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def make_client(tmp_path: Path) -> TestClient:
    database_url = f"sqlite:///{tmp_path / 'workhub-agent-test.db'}"
    return TestClient(create_app(database_url=database_url))


def test_agent_searches_messages_then_summarizes_the_results(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/agent/chat",
            json={"message": "Find and summarize chat messages about acceptance criteria."},
        )

    assert response.status_code == 200
    payload = response.json()
    assert [call["name"] for call in payload["tool_calls"]] == [
        "search_messages",
        "summarize_messages",
    ]
    assert payload["tool_calls"][0]["arguments"] == {"query": "acceptance criteria"}
    assert payload["tool_calls"][0]["result"]["count"] == 1
    assert "acceptance criteria" in payload["tool_calls"][1]["result"]["summary"].lower()
    assert payload["answer"] == payload["tool_calls"][1]["result"]["summary"]


def test_agent_searches_existing_email_data(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/agent/chat",
            json={"message": "Find customer emails."},
        )

    assert response.status_code == 200
    payload = response.json()
    assert [call["name"] for call in payload["tool_calls"]] == ["search_emails"]
    assert payload["tool_calls"][0]["arguments"] == {"query": "customer"}
    assert payload["tool_calls"][0]["result"]["count"] == 1
    assert payload["tool_calls"][0]["result"]["emails"][0]["subject"] == "Customer Feedback"


def test_agent_routes_the_chinese_customer_email_example(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/agent/chat",
            json={"message": "查一下客户邮件"},
        )

    assert response.status_code == 200
    payload = response.json()
    assert [call["name"] for call in payload["tool_calls"]] == ["search_emails"]
    assert payload["tool_calls"][0]["arguments"] == {"query": "customer"}
    assert payload["tool_calls"][0]["result"]["count"] == 1


def test_agent_can_return_message_search_results_without_summary(tmp_path: Path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/agent/chat",
            json={"message": "Find chat messages about the API response types."},
        )

    assert response.status_code == 200
    payload = response.json()
    assert [call["name"] for call in payload["tool_calls"]] == ["search_messages"]
    assert payload["tool_calls"][0]["result"]["count"] == 1
    assert "API response types" in payload["answer"]
