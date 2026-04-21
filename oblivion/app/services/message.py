from app.core.config import settings
from app.core.database import db
from app.models.chat import MessageRequest
from app.services.gemini import get_ai_response
from app.services.chat import get_branch_path
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException
import asyncio


async def _save_message(
    conv_id: str, 
    parent_id: str | None, 
    role: str, 
    content: str, 
    title: str | None = None, 
    metadata: dict | None = None
) -> tuple[str, dict]:
    """Inserts a new message into the database and returns its ID and document."""
    msg_doc = {
        "conversation_id": conv_id,
        "parent_id": parent_id,
        "role": role,
        "title": title,
        "content": content,
        "is_deleted": False,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.UTC),
        "updated_at": None
    }
    result = await db.messages.insert_one(msg_doc)
    msg_id = str(result.inserted_id)
    msg_doc["id"] = msg_id
    return msg_id, msg_doc

async def _generate_ai_content(parent_id: str | None, user_content: str, user_msg_id: str) -> str:
    """Builds the context history and fetches the AI response, handling mock mode and errors."""
    branch_messages = await get_branch_path(parent_id)
    history = [
        {"role": m["role"], "parts": [m["content"]]} 
        for m in branch_messages if not m.get("is_deleted", False)
    ]

    try:
        if settings.use_mock_ai:
            await asyncio.sleep(3) # Simulate network latency
            mock_doc = await db.messages.find_one({"role": "model", "is_deleted": False})
            if mock_doc:
                return mock_doc["content"]
            return f"**[MOCK MODE]** I received: *'{user_content}'*."
        else:
            return await get_ai_response(history, user_content)
            
    except Exception as e:
        # Rollback the user's message if the AI API fails
        await db.messages.delete_one({"_id": ObjectId(user_msg_id)})
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

async def _update_branch_pointers(conv_id: str, request: MessageRequest, ai_msg_id: str):
    """Handles the Strict Immutable Trunk Pointer Swap logic for managing forks."""
    current_branch = await db.branches.find_one({"_id": ObjectId(request.current_branch_id)})
    
    if not current_branch:
        return

    old_head_id = current_branch.get("head_message_id")
    
    if old_head_id != request.parent_id:
        # SCENARIO A: Forking from an older message
        
        # 1. Preserve the old trail in a NEW branch
        await db.branches.insert_one({
            "conversation_id": conv_id,
            "name": request.og_trail_branch_name or f"{current_branch['name']} (Original Trail)",
            "head_message_id": old_head_id,
            "created_at": datetime.now(timezone.UTC)
        })
        
        # 2. Put the new fork in a NEW branch
        await db.branches.insert_one({
            "conversation_id": conv_id,
            "name": request.title or f"{current_branch['name']} (New Fork)",
            "head_message_id": ai_msg_id,
            "created_at": datetime.now(timezone.UTC)
        })
        
        # 3. Cap the CURRENT branch (Main) exactly at the fork point
        await db.branches.update_one(
            {"_id": ObjectId(request.current_branch_id)},
            {"$set": {"head_message_id": request.parent_id}} 
        )
        
    elif request.force_new_branch:
        # SCENARIO B: Forking at the very end of the line
        await db.branches.insert_one({
            "conversation_id": conv_id,
            "name": request.title or f"{current_branch['name']} (New Fork)",
            "head_message_id": ai_msg_id,
            "created_at": datetime.now(timezone.UTC)
        })
        
    else:
        # SCENARIO C: Normal linear chatting
        await db.branches.update_one(
            {"_id": ObjectId(request.current_branch_id)},
            {"$set": {"head_message_id": ai_msg_id}}
        )