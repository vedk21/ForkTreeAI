from contextlib import asynccontextmanager

import fastapi_swagger_dark as fsd
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import conversations
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Branching AI API",
    docs_url=None,  # Disable default docs
)

# Setup Swagger UI with dark theme
router = APIRouter()
fsd.install(router)  # default path /docs with dark theme
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(conversations.router)
