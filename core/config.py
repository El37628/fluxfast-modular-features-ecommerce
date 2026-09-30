import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="APP_",
        env_file=".env",
        extra="ignore",
    )

    NAME: str = "FluxFast Modular Features E-Commerce"
    ENV: str = "development"
    DATABASE_URL: str = "sqlite+aiosqlite:///./ecommerce_modular.db"

    @property
    def is_debug(self) -> bool:
        return self.ENV.lower() in ("development", "test", "dev")


settings = Settings()

if "DATABASE_URL" in os.environ:
    settings.DATABASE_URL = os.environ["DATABASE_URL"]
