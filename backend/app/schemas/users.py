from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.schemas.common import ORMModel


class WebsiteUserBase(BaseModel):
    username: str
    email: EmailStr
    role_id: int
    warehouses: list[int] = []
    active: bool = True


class WebsiteUserCreate(WebsiteUserBase):
    password: str


class WebsiteUserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    role_id: int | None = None
    warehouses: list[int] | None = None
    active: bool | None = None


class WebsiteUserRead(ORMModel, WebsiteUserBase):
    id: int
    last_login: datetime | None = None
    created_at: datetime


class PocketUserBase(BaseModel):
    username: str
    role_id: int
    warehouses: list[int] = []
    active: bool = True


class PocketUserCreate(PocketUserBase):
    password: str


class PocketUserUpdate(BaseModel):
    username: str | None = None
    role_id: int | None = None
    warehouses: list[int] | None = None
    active: bool | None = None


class PocketUserRead(ORMModel, PocketUserBase):
    id: int
    last_login: datetime | None = None
    created_at: datetime


class ResetPasswordRequest(BaseModel):
    password: str
