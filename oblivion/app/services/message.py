import asyncio
from datetime import UTC, datetime

from bson import ObjectId
from fastapi import HTTPException

from app.core.config import settings
from app.core.database import db
from app.models.chat import MessageRequest, MessageResponse
from app.services.gemini import get_ai_response


async def get_branch_path(leaf_message_id: str | None) -> list[MessageResponse]:
    if not leaf_message_id:
        return []

    chain: list[MessageResponse] = []
    current_id = leaf_message_id

    while current_id:
        msg = await db.messages.find_one({"_id": ObjectId(current_id)})
        if not msg:
            break
        msg["id"] = str(msg.pop("_id"))
        chain.insert(0, msg)
        current_id = msg.get("parent_id")

    return chain


async def _save_message(
    conv_id: str, parent_id: str | None, role: str, content: str, metadata: dict | None = None
) -> tuple[str, dict]:
    """Inserts a new message into the database and returns its ID and document."""
    msg_doc = {
        "conversation_id": conv_id,
        "parent_id": parent_id,
        "role": role,
        "content": content,
        "is_deleted": False,
        "metadata": metadata or {},
        "created_at": datetime.now(UTC),
        "updated_at": None,
    }
    result = await db.messages.insert_one(msg_doc)
    msg_id = str(result.inserted_id)
    msg_doc["id"] = msg_id
    return msg_id, msg_doc


async def _generate_ai_content(parent_id: str | None, user_content: str, user_msg_id: str) -> str:
    """Builds the context history and fetches the AI response, handling mock mode and errors."""
    branch_messages = await get_branch_path(parent_id)
    history = [{"role": m.role, "parts": [m.content]} for m in branch_messages if not m.is_deleted]

    try:
        if settings.use_mock_ai:
            await asyncio.sleep(3)  # Simulate network latency
            mock_doc = await db.messages.find_one({"role": "model", "is_deleted": False})
            if mock_doc:
                return str(mock_doc["content"])
            return f"**[MOCK MODE]** I received: *'{user_content}'*."
        else:
            return await get_ai_response(history, user_content)

    except Exception as e:
        # Rollback the user's message if the AI API fails
        await db.messages.delete_one({"_id": ObjectId(user_msg_id)})
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}") from e


async def _update_branch_pointers(conv_id: str, request: MessageRequest, ai_msg_id: str) -> None:

    # IF FIRST MESSAGE: Create the Root Branch
    if not request.current_branch_id and not request.parent_id:
        await db.branches.insert_one(
            {
                "conversation_id": conv_id,
                "name": request.new_branch_name or "Main Branch",
                "head_message_id": ai_msg_id,
                "parent_branch_id": None,
                "fork_message_id": None,
                "created_at": datetime.now(UTC),
            }
        )
        return

    current_branch = await db.branches.find_one({"_id": ObjectId(request.current_branch_id)})
    if not current_branch:
        return

    old_head_id = current_branch.get("head_message_id")
    current_branch_str_id = str(current_branch["_id"])

    if old_head_id != request.parent_id:
        # SCENARIO A: Forking from an older message

        # 1. Preserve the old trail in a NEW branch
        await db.branches.insert_one(
            {
                "conversation_id": conv_id,
                "name": request.og_trail_branch_name
                or f"{current_branch['name']} (Original Trail)",
                "head_message_id": old_head_id,
                "parent_branch_id": current_branch_str_id,
                "fork_message_id": request.parent_id,  # The fork happened exactly at request.parent_id
                "created_at": datetime.now(UTC),
            }
        )

        # 2. Put the new fork in a NEW branch
        await db.branches.insert_one(
            {
                "conversation_id": conv_id,
                "name": request.new_branch_name or f"{current_branch['name']} (New Fork)",
                "head_message_id": ai_msg_id,
                "parent_branch_id": current_branch_str_id,
                "fork_message_id": request.parent_id,
                "created_at": datetime.now(UTC),
            }
        )

        # 3. Cap the CURRENT branch (Main) exactly at the fork point
        await db.branches.update_one(
            {"_id": ObjectId(request.current_branch_id)},
            {"$set": {"head_message_id": request.parent_id}},
        )

    elif request.force_new_branch:
        # SCENARIO B: Forking at the very end of the line
        await db.branches.insert_one(
            {
                "conversation_id": conv_id,
                "name": request.new_branch_name or f"{current_branch['name']} (New Fork)",
                "head_message_id": ai_msg_id,
                "parent_branch_id": current_branch_str_id,
                "fork_message_id": request.parent_id,
                "created_at": datetime.now(UTC),
            }
        )

    else:
        # SCENARIO C: Normal linear chatting
        await db.branches.update_one(
            {"_id": ObjectId(request.current_branch_id)}, {"$set": {"head_message_id": ai_msg_id}}
        )
