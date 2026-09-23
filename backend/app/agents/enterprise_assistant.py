import re

from app.skills import EnterpriseSkills


class EnterpriseAssistant:
    """A deliberately small router that makes every Skill call visible."""

    def _extract_query(self, message: str, resource: str) -> str:
        chinese = re.search(
            rf"关于(.+?)(?:的)?(?:{resource})",
            message,
            flags=re.IGNORECASE,
        )
        if chinese:
            return chinese.group(1).strip()

        about = re.search(r"(?:about|regarding)\s+(.+)$", message, re.IGNORECASE)
        if about:
            return re.sub(r"\s+(?:and\s+)?summari[sz]e$", "", about.group(1), flags=re.IGNORECASE).strip(" .?!")

        cleaned = re.sub(
            r"\b(?:find|search|check|recent|customer|chat|messages?|emails?|mail)\b",
            " ",
            message,
            flags=re.IGNORECASE,
        )
        cleaned = re.sub(r"\b(?:and\s+)?summari[sz]e\b", " ", cleaned, flags=re.IGNORECASE)
        query = " ".join(cleaned.strip(" .?!").split())
        if "customer" in message.lower() and not query:
            return "customer"
        return query or message.strip(" .?!")

    def run(self, message: str, skills: EnterpriseSkills) -> dict:
        lower = message.lower()
        traces: list[dict] = []

        if any(keyword in lower for keyword in ("email", "mail", "邮件")):
            query = self._extract_query(message, "邮件")
            if "customer" in lower or "客户" in message:
                query = "customer"
            arguments = {"query": query}
            result = skills.execute("search_emails", arguments)
            traces.append(
                {"name": "search_emails", "arguments": arguments, "result": result}
            )
            if not result["emails"]:
                answer = "No matching emails were found."
            else:
                answer = "\n".join(
                    f"{email['sender']}: {email['subject']} — {email['body']}"
                    for email in result["emails"]
                )
            return {"answer": answer, "tool_calls": traces}

        query = self._extract_query(message, "聊天|消息")
        search_arguments = {"query": query}
        search_result = skills.execute("search_messages", search_arguments)
        traces.append(
            {
                "name": "search_messages",
                "arguments": search_arguments,
                "result": search_result,
            }
        )

        wants_summary = any(
            keyword in lower for keyword in ("summarize", "summary", "总结")
        )
        if wants_summary:
            summary_arguments = {"messages": search_result["messages"]}
            summary_result = skills.execute("summarize_messages", summary_arguments)
            traces.append(
                {
                    "name": "summarize_messages",
                    "arguments": summary_arguments,
                    "result": summary_result,
                }
            )
            answer = summary_result["summary"]
        elif search_result["messages"]:
            answer = "\n".join(
                f"{item['sender']}: {item['content']}"
                for item in search_result["messages"]
            )
        else:
            answer = "No matching chat messages were found."

        return {"answer": answer, "tool_calls": traces}
