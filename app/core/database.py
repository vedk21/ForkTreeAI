from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

client = AsyncIOMotorClient(settings.mongo_url)
db = client.branchChatPOC


async def init_db():
    """Ensure indexes exist for performance."""
    await db.messages.create_index([("conversation_id", 1)])
    await db.messages.create_index([("parent_id", 1)])
