from fastapi import APIRouter

from app.models.chat import ConversationRequest, MessageRequest, MessageResponse, MessageUpdate
from app.services import chat as chat_service

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("", response_model=dict)
async def create_conversation(request: ConversationRequest):
    result = await chat_service.create_conversation(request.title)
    return {
        "conversation_id": str(result.get("_id")),
        "title": request.title,
        "created_at": result.get("created_at"),
        "updatedAt": result.get("updated_at"),
        "is_deleted": result.get("is_deleted"),
    }


@router.post("/{conv_id}/messages", response_model=MessageResponse)
async def send_message(conv_id: str, request: MessageRequest):
    return await chat_service.process_new_message(conv_id, request)


@router.get("/{conv_id}/messages", response_model=list[MessageResponse])
async def get_all_messages(conv_id: str):
    return await chat_service.get_all_messages(conv_id)

@router.get("/{conv_id}/branch-messages/{branch_id}", response_model=list[MessageResponse])
async def get_branch_messages(conv_id: str, branch_id: str):
    return await chat_service.get_messages_for_branch(conv_id, branch_id)


@router.get("/{conv_id}/branches/{leaf_id}", response_model=list[MessageResponse])
async def get_branch(conv_id: str, leaf_id: str):
    return await chat_service.get_branch_path(leaf_id)


@router.patch("/{conv_id}/messages/{msg_id}", response_model=MessageResponse)
async def edit_message(conv_id: str, msg_id: str, request: MessageUpdate):
    """Updates a message's content, title, or metadata."""
    return await chat_service.update_message(msg_id, request)


@router.delete("/{conv_id}/messages/{msg_id}", response_model=MessageResponse)
async def soft_delete_message(conv_id: str, msg_id: str):
    """Soft deletes a message, keeping the tree intact."""
    return await chat_service.delete_message(msg_id)
