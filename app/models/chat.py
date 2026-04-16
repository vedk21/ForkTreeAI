from datetime import datetime

from pydantic import BaseModel, Field


class ConversationRequest(BaseModel):
    title: str = Field(default="New Branching Chat", description="Title of the conversation")


class MessageRequest(BaseModel):
    content: str
    parent_id: str | None = Field(default=None, description="ID of the parent message")
    title: str | None = Field(default=None, description="Node title for the UI")
    metadata: dict = Field(default_factory=dict, description="Flexible key-value storage")


class MessageUpdate(BaseModel):
    content: str | None = None
    title: str | None = None
    metadata: dict | None = None


class MessageResponse(BaseModel):
    id: str
    parent_id: str | None
    role: str
    title: str | None
    content: str
    is_deleted: bool
    metadata: dict
    created_at: datetime
    updated_at: datetime | None
