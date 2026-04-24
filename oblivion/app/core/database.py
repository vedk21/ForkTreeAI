from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongo_url)
db = client.forkTreeAI


async def init_db() -> None:
    """Ensure indexes exist for performance."""
    await db.messages.create_index([("conversation_id", 1)])
    await db.messages.create_index([("parent_id", 1)])

    await db.branches.create_index([("conversation_id", 1)])
    await db.branches.create_index([("parent_branch_id", 1)])
