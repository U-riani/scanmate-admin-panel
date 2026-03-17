from pydantic import BaseModel, EmailStr

from app.schemas.roles import WebsiteRoleRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    id: int
    email: EmailStr
    username: str
    role_id: int
    role: WebsiteRoleRead
    warehouses: list[int]


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    user: LoginUser
