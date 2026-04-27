import asyncio

from fastapi import APIRouter

from app.models.chat import (
    ConversationRequest,
    MessageRequest,
    MessageResponse,
    MessageUpdate,
    TreeMessageResponse,
    TreeViewResponse,
)
from app.services import chat as chat_service
from app.services.message import get_branch_path

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("", response_model=TreeMessageResponse)
async def create_conversation(request: ConversationRequest) -> TreeMessageResponse:
    return await chat_service.create_conversation(request)


@router.post("/{conv_id}/messages", response_model=TreeMessageResponse)
async def send_message(conv_id: str, request: MessageRequest) -> TreeMessageResponse:
    return await chat_service.process_new_message(conv_id, request)


@router.get("/{conv_id}/messages", response_model=list[MessageResponse])
async def get_all_messages(conv_id: str) -> list[MessageResponse]:
    return await chat_service.get_all_messages(conv_id)


@router.get("/{conv_id}/branches/{leaf_id}", response_model=list[MessageResponse])
async def get_all_messages_by_leaf(conv_id: str, leaf_id: str) -> list[MessageResponse]:
    return await get_branch_path(leaf_id)


@router.patch("/{conv_id}/messages/{msg_id}", response_model=MessageResponse)
async def edit_message(conv_id: str, msg_id: str, request: MessageUpdate) -> MessageResponse:
    """Updates a message's content, or metadata."""
    return await chat_service.update_message(msg_id, request)


@router.delete("/{conv_id}/messages/{msg_id}", response_model=MessageResponse)
async def soft_delete_message(conv_id: str, msg_id: str) -> MessageResponse:
    """Soft deletes a message, keeping the tree intact."""
    return await chat_service.delete_message(msg_id)


@router.get("/tree-view", response_model=list[TreeViewResponse])
async def get_tree_view() -> list[TreeViewResponse]:
    """Gets the nested tree of all conversations and branches."""
    await asyncio.sleep(5)
    return await chat_service.get_tree_view()


@router.get("/{conv_id}/branch-messages/{branch_id}", response_model=list[MessageResponse])
async def get_branch_messages(conv_id: str, branch_id: str) -> list[MessageResponse]:
    """Gets ONLY the messages inside that specific branch block (stops at fork)."""
    await asyncio.sleep(5)
    return await chat_service.get_messages_for_branch(conv_id, branch_id)
