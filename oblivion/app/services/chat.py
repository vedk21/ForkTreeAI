import asyncio
from datetime import UTC, datetime
from typing import Any, cast

from bson import ObjectId
from fastapi import HTTPException

from app.core.config import settings
from app.core.database import db
from app.models.chat import (
    ConversationRequest,
    MessageRequest,
    MessageResponse,
    MessageUpdate,
    TreeViewResponse,
)
from app.services.message import _generate_ai_content, _save_message, _update_branch_pointers


async def create_conversation(request: ConversationRequest) -> TreeViewResponse:
    doc = {
        "title": request.title,
        "created_at": datetime.now(UTC),
        "updated_at": None,
        "is_deleted": False,
    }
    result = await db.conversations.insert_one(doc)
    # Create new message using request.content
    result = await process_new_message(
        str(result.inserted_id),
        MessageRequest(content=request.content, new_branch_name=request.title),
    )

    # Get branch details for this new conversation_id
    branch_result = await db.branches.find_one({"conversation_id": str(result.conversation_id)})

    if branch_result is None:
        raise HTTPException(status_code=404, detail="Branch not found")

    branch_result = cast(dict[str, Any], branch_result)
    branch_result["id"] = str(branch_result.pop("_id"))

    # Wait before sending respose
    await asyncio.sleep(5)

    return TreeViewResponse(
        id=branch_result.get("id"),
        conversation_id=str(branch_result.get("conversation_id")),
        name_of_branch=request.title or "Main Branch",
        branch_id=branch_result.get("id"),
        created_at=branch_result.get("created_at"),
        updated_at=None,
        children=[],
    )


async def process_new_message(conv_id: str, request: MessageRequest) -> MessageResponse:
    """Orchestrates the flow of saving messages, fetching AI context, and updating branches."""

    # 1. Save User Message
    user_msg_id, _ = await _save_message(
        conv_id=conv_id,
        parent_id=request.parent_id,
        role="user",
        content=request.content,
        metadata=request.metadata,
    )

    # 2. Generate AI Content
    ai_content = await _generate_ai_content(
        parent_id=request.parent_id, user_content=request.content, user_msg_id=user_msg_id
    )

    # 3. Save AI Message
    ai_msg_id, ai_msg_doc = await _save_message(
        conv_id=conv_id,
        parent_id=user_msg_id,
        role="model",
        content=ai_content,
        metadata={"model_used": "mocked-data" if settings.use_mock_ai else settings.ai_model_name},
    )

    # 4. Handle Branch Pointers
    await _update_branch_pointers(conv_id, request, ai_msg_id)

    # Clean up the raw MongoDB _id before returning the Pydantic-compatible dict
    ai_msg_doc.pop("_id", None)
    return MessageResponse(**ai_msg_doc)


async def get_all_messages(conv_id: str) -> list[MessageResponse]:
    cursor = db.messages.find({"conversation_id": conv_id, "is_deleted": False}).sort(
        "created_at", 1
    )
    messages = await cursor.to_list(length=1000)
    for m in messages:
        m["id"] = str(m.pop("_id"))
    return messages


async def update_message(msg_id: str, update_data: MessageUpdate) -> MessageResponse:
    """Updates a message after validating it is a user role."""
    # 1. Fetch message to validate role
    existing_msg = await db.messages.find_one({"_id": ObjectId(msg_id)})

    if not existing_msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if existing_msg.get("role") != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be updated.")

    # 2. Perform update
    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}

    if not update_fields:
        raise HTTPException(status_code=400, detail="No valid fields provided for update.")

    update_fields["updated_at"] = datetime.now(UTC)

    result = await db.messages.find_one_and_update(
        {"_id": ObjectId(msg_id)}, {"$set": update_fields}, return_document=True
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Message not found")

    result = cast(dict[str, Any], result)
    result["id"] = str(result.pop("_id"))
    return MessageResponse(**result)


async def delete_message(msg_id: str) -> MessageResponse:
    """Soft deletes a user message and its direct AI response."""
    # 1. Fetch message to validate role
    existing_msg = await db.messages.find_one({"_id": ObjectId(msg_id)})

    if not existing_msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if existing_msg.get("role") != "user":
        raise HTTPException(status_code=400, detail="Only user messages can be deleted.")

    now = datetime.now(UTC)

    # 2. Soft delete the user message
    result = await db.messages.find_one_and_update(
        {"_id": ObjectId(msg_id)},
        {"$set": {"is_deleted": True, "updated_at": now}},
        return_document=True,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Message not found")

    # 3. Soft delete the immediate AI response (where parent_id == this msg_id and role is model)
    await db.messages.update_many(
        {"parent_id": msg_id, "role": "model"}, {"$set": {"is_deleted": True, "updated_at": now}}
    )

    result = cast(dict[str, Any], result)
    result["id"] = str(result.pop("_id"))
    return MessageResponse(**result)


async def get_tree_view() -> list[TreeViewResponse]:
    """Builds the nested JSON hierarchy of all conversations and branches."""
    # 1. Use MongoDB Aggregation to fetch only valid branches
    pipeline: list[dict[str, Any]] = [
        {
            # Cross-reference the messages collection
            "$lookup": {
                "from": "messages",
                "let": {"head_id": {"$toObjectId": "$head_message_id"}},
                "pipeline": [{"$match": {"$expr": {"$eq": ["$_id", "$$head_id"]}}}],
                "as": "head_message_data",
            }
        },
        {
            # Flatten the joined array into a single object
            "$unwind": {
                "path": "$head_message_data",
                "preserveNullAndEmptyArrays": False,  # Drops the branch entirely if the head message is physically missing
            }
        },
        {
            # THE FIX: Filter out branches where the head message is soft-deleted
            "$match": {"head_message_data.is_deleted": False}
        },
        {"$sort": {"created_at": 1}},
    ]

    cursor = db.branches.aggregate(pipeline)
    branches = await cursor.to_list(length=5000)

    branch_map = {}
    root_branches = []

    # 2. Format every valid branch into the JSON structure
    for b in branches:
        b_id = str(b["_id"])
        created_at_val = b.get("created_at")

        branch_map[b_id] = {
            "id": b_id,
            "conversation_id": b.get("conversation_id"),
            "name_of_branch": b.get("name"),
            "branch_id": b_id,
            "created_at": created_at_val.isoformat()
            if hasattr(created_at_val, "isoformat")
            else created_at_val,
            "updated_at": b.get("updated_at"),
            "children": [],
        }

    # 3. Connect the children to their parents
    for b in branches:
        b_id = str(b["_id"])
        parent_id = b.get("parent_branch_id")

        if parent_id:
            # Only attach if the parent wasn't filtered out by the deletion check!
            if parent_id in branch_map:
                branch_map[parent_id]["children"].append(branch_map[b_id])

            # NOTE: If parent_id is NOT in branch_map, it means the parent branch was deleted.
            # By doing nothing here, we automatically "hide" all children of a deleted parent.
        else:
            # If it has no parent, it's the root of a conversation
            root_branches.append(branch_map[b_id])

    return root_branches


async def get_messages_for_branch(conv_id: str, branch_id: str) -> list[MessageResponse]:
    """Returns ONLY the messages unique to this branch (stops at the fork point)."""
    branch = await db.branches.find_one({"_id": ObjectId(branch_id), "conversation_id": conv_id})
    if not branch:
        return []

    head_id = branch["head_message_id"]
    fork_id = branch.get("fork_message_id")  # This is where we need to stop

    chain: list[dict[str, Any]] = []
    current_id = head_id

    # Traverse bottom-up, but STOP when we hit the fork point
    while current_id:
        if fork_id and current_id == fork_id:
            break

        msg = await db.messages.find_one({"_id": ObjectId(current_id)})
        if not msg:
            break

        msg["id"] = str(msg.pop("_id"))
        chain.insert(0, msg)
        current_id = msg.get("parent_id")

    return [MessageResponse(**msg) for msg in chain]
