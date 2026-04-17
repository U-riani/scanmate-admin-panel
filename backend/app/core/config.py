# backend/app/core/config.py
# from pydantic_settings import BaseSettings, SettingsConfigDict

# class Settings(BaseSettings):
#     APP_NAME: str = "Scanmate Backend"
#     APP_ENV: str = "development"

#     SECRET_KEY: str = "change-me"
#     ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

#     DB_HOST: str = "localhost"
#     DB_PORT: int = 5432
#     DB_USER: str = "postgres"
#     DB_PASSWORD: str = "postgres"
#     DB_NAME: str = "scanmate"

#     CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

#     model_config = SettingsConfigDict(
#         env_file=".env",
#         case_sensitive=True,
#         extra="ignore"
#     )
#     @property
#     def database_url(self) -> str:
#         return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

#     @property
#     def cors_origins_list(self) -> list[str]:
#         return [i.strip() for i in self.CORS_ORIGINS.split(",") if i.strip()]


# settings = Settings()

# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Scanmate Backend"
    APP_ENV: str = "development"

    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str | None = None

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "scanmate"

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://scanmate-admin.netlify.app/"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def database_url(self) -> str:
        if self.APP_ENV.lower() == "production":
            if not self.DATABASE_URL or not self.DATABASE_URL.strip():
                raise ValueError("DATABASE_URL is required in production")

        if self.DATABASE_URL and self.DATABASE_URL.strip():
            url = self.DATABASE_URL.strip()

            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

            return url

        return (
            f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [i.strip() for i in self.CORS_ORIGINS.split(",") if i.strip()]


settings = Settings()