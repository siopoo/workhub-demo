from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


class ToolCallTrace(BaseModel):
    name: str
    arguments: dict
    result: dict


class AgentResponse(BaseModel):
    answer: str
    tool_calls: list[ToolCallTrace]
