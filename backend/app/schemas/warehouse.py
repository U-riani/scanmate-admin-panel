from pydantic import BaseModel
from app.schemas.common import ORMModel


class WarehouseBase(BaseModel):
    name: str
    code: str
    active: bool = True


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    active: bool | None = None


class WarehouseRead(ORMModel, WarehouseBase):
    id: int
