from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import ORMModel


class ReceiveCreate(BaseModel):
    name: str
    number: str | None = None
    warehouse_id: int
    type: str | None = None
    receiver_user_id: int | None = None
    created_by: int | None = None


class ReceiveStatusUpdate(BaseModel):
    status: str


class ReceiveRead(ORMModel):
    id: int
    name: str
    number: str | None = None

    warehouse_id: int

    type: str | None = None

    status: str

    receiver_user_id: int | None = None

    received_at: datetime | None = None

    created_by: int | None = None

    created_at: datetime
    updated_at: datetime

    total_lines: int
    received_lines: int
    difference_lines: int

    is_locked: bool
    closed_at: datetime | None = None

class ReceiveLineBase(BaseModel):
    product_id: int | None = None
    barcode: str
    article_code: str | None = None
    product_name: str | None = None

    color: str | None = None
    size: str | None = None

    price: float = 0

    expected_qty: int = 0


class ReceiveLineCreate(ReceiveLineBase):
    pass


class ReceiveLineUpdate(BaseModel):
    expected_qty: int | None = None
    received_qty: int | None = None
    recount_qty: int | None = None
    recount_requested: bool | None = None


class ReceiveLineRead(ORMModel):
    id: int
    document_id: int

    product_id: int | None = None

    barcode: str
    article_code: str | None = None
    product_name: str | None = None

    color: str | None = None
    size: str | None = None

    price: float

    expected_qty: int
    received_qty: int

    recount_qty: int | None = None
    recount_requested: bool

    difference_qty: int

    receiver_user_id: int | None = None

    received_scanned_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

    box_id: str | None = None