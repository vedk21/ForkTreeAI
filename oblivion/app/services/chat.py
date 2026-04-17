import uuid
import asyncio
from datetime import UTC, datetime

from bson import ObjectId
from fastapi import HTTPException

from app.core.config import settings
from app.core.database import db
from app.models.chat import MessageRequest, MessageUpdate
from app.services.gemini import get_ai_response


async def create_conversation(title: str) -> str:
    doc = {
        "title": title,
        "created_at": datetime.now(UTC),
        "updated_at": None,
        "is_deleted": False,
    }
    result = await db.conversations.insert_one(doc)

    # Fetch the inserted document by its _id
    created_doc = await db.conversations.find_one({"_id": result.inserted_id})
    return created_doc


async def get_branch_path(leaf_message_id: str | None) -> list[dict]:
    if not leaf_message_id:
        return []

    chain = []
    current_id = leaf_message_id

    while current_id:
        msg = await db.messages.find_one({"_id": ObjectId(current_id)})
        if not msg:
            break
        msg["id"] = str(msg.pop("_id"))
        chain.insert(0, msg)
        current_id = msg.get("parent_id")

    return chain


async def process_new_message(conv_id: str, request: MessageRequest) -> dict:
    # 1. Determine Branch ID
    branch_id = None
    if not request.parent_id:
        # Root message
        branch_id = str(uuid.uuid4())
    else:
        parent_msg = await db.messages.find_one({"_id": ObjectId(request.parent_id)})
        if not parent_msg:
            raise HTTPException(status_code=404, detail="Parent message not found")
            
        existing_child = await db.messages.find_one({
            "parent_id": request.parent_id, 
            "is_deleted": False
        })
        
        if existing_child or request.force_new_branch:
            branch_id = str(uuid.uuid4())
        else:
            branch_id = parent_msg.get("branch_id")

    # 2. Rebuild Timeline for AI Context
    branch_messages = await get_branch_path(request.parent_id)

    # Exclude soft-deleted messages from the AI's context history
    history = [
        {"role": m["role"], "parts": [m["content"]]}
        for m in branch_messages
        if not m.get("is_deleted", False)
    ]

    # 3. Save User Message
    user_msg = {
        "conversation_id": conv_id,
        "branch_id": branch_id,
        "parent_id": request.parent_id,
        "role": "user",
        "title": request.title,
        "content": request.content,
        "is_deleted": False,
        "metadata": request.metadata,
        "created_at": datetime.now(UTC),
        "updated_at": None,
    }
    user_result = await db.messages.insert_one(user_msg)
    user_msg_id = str(user_result.inserted_id)

    # 4. Determine AI Response (Mock vs Live)
    ai_content = ""
    try:
        if settings.use_mock_ai:
            # Simulate processing time for UI loading states
            await asyncio.sleep(3)

            # Try to grab an existing model response from the DB
            mock_doc = await db.messages.find_one({"role": "model", "is_deleted": False})

            if mock_doc:
                ai_content = mock_doc["content"]
            else:
                # Fallback if DB has no model messages yet.
                # Using Markdown to help test UI rendering (bolding, lists, code blocks).
                ai_content = (
                    f"**[MOCK MODE]** I received your message: *'{request.content}'*.\n\n"
                    "Here is a mock response because `USE_MOCK_AI` is set to `true`.\n"
                    "- List item 1\n"
                    "- List item 2\n\n"
                    "```python\nprint('Hello from Mock UI Test')\n```"
                )
        else:
            # LIVE API CALL
            ai_content = await get_ai_response(history, request.content)

    except Exception as e:
        await db.messages.delete_one({"_id": ObjectId(user_msg_id)})
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}") from e

    # 5. Save AI Message
    ai_msg = {
        "conversation_id": conv_id,
        "branch_id": branch_id,
        "parent_id": user_msg_id,
        "role": "model",
        "title": None,
        "content": ai_content,
        "is_deleted": False,
        "metadata": {"model_used": settings.ai_model_name},
        "created_at": datetime.now(UTC),
        "updated_at": None,
    }
    ai_result = await db.messages.insert_one(ai_msg)

    ai_msg["id"] = str(ai_result.inserted_id)
    return ai_msg

async def get_messages_by_branch(conv_id: str, branch_id: str) -> list[dict]:
    cursor = db.messages.find({
        "conversation_id": conv_id,
        "branch_id": branch_id,
        "is_deleted": False
        }).sort("created_at", 1)
    messages = await cursor.to_list(length=1000)
    for m in messages:
        m["id"] = str(m.pop("_id"))
    return messages

async def get_all_messages(conv_id: str) -> list[dict]:
    cursor = db.messages.find({
        "conversation_id": conv_id,
        "is_deleted": False
        }).sort("created_at", 1)
    messages = await cursor.to_list(length=1000)
    for m in messages:
        m["id"] = str(m.pop("_id"))
    return messages


async def update_message(msg_id: str, update_data: MessageUpdate) -> dict:
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
        {"_id": ObjectId(msg_id)},
        {"$set": update_fields},
        return_document=True
    )

    result["id"] = str(result.pop("_id"))
    return result


async def delete_message(msg_id: str) -> dict:
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

    # 3. Soft delete the immediate AI response (where parent_id == this msg_id and role is model)
    await db.messages.update_many(
        {"parent_id": msg_id, "role": "model"}, {"$set": {"is_deleted": True, "updated_at": now}}
    )

    result["id"] = str(result.pop("_id"))
    return result
