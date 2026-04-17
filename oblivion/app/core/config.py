from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str
    mongo_url: str = "mongodb://localhost:27017"
    ai_model_name: str = "gemini-2.5-flash"
    use_mock_ai: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
