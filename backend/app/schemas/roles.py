from pydantic import BaseModel
from app.schemas.common import ORMModel


class RoleBase(BaseModel):
    name: str
    description: str | None = None
    modules: dict


class WebsiteRoleCreate(RoleBase):
    pass


class WebsiteRoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    modules: dict | None = None


class WebsiteRoleRead(ORMModel, RoleBase):
    id: int


class PocketRoleCreate(RoleBase):
    pass


class PocketRoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    modules: dict | None = None


class PocketRoleRead(ORMModel, RoleBase):
    id: int
