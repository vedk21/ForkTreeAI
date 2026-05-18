FROM python:3.13-slim

# Copy uv binaries from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./

# Sync dependencies using uv (creates a virtual environment at /app/.venv)
# --no-install-project prevents installing the app code itself before it's copied
RUN uv sync --frozen --no-install-project --no-dev

# Copy application code
COPY . .

# Sync the project itself
RUN uv sync --frozen --no-dev

# Place the virtual environment in the PATH so uvicorn is available
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8001

# Run the FastAPI application using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]