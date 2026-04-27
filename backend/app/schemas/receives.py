#backend/app/schemas/receives.py

from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.common import ORMModel
from app.models.enums import DocumentModule, ScanType, ReceiveStatus


class ReceiveCreate(BaseModel):
    name: str
    number: str | None = None
    warehouse_id: int
    module: DocumentModule = DocumentModule.receive
    scan_type: ScanType = ScanType.barcode
    description: str | None = None
    receiver_user_ids: list[int] = []



class ReceiveStatusUpdate(BaseModel):
    prev_status: str
    new_status: str


class ReceiveRead(ORMModel):
    id: int
    name: str
    number: str | None = None

    warehouse_id: int

    module: DocumentModule
    scan_type: ScanType

    status: ReceiveStatus

    receiver_user_ids: list[int] = []
    recount_user_ids: list[int] = []
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
    barcode: str
    article_code: str | None = None
    product_name: str | None = None

    color: str | None = None
    size: str | None = None
    price: float | None = None

    expected_qty: int = 0
    counted_qty: int | None = None

    box_id: str | None = None


class ReceiveLineCreate(ReceiveLineBase):
    pass


class ReceiveLineUpdate(BaseModel):
    expected_qty: int | None = None
    counted_qty: int | None = None
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
    counted_qty: int | None = None

    recount_qty: int | None = None
    recount_requested: bool

    difference_qty: int

    receiver_user_id: int | None = None

    received_scanned_at: datetime | None = None

    created_at: datetime
    updated_at: datetime

    box_id: str | None = None

class ImportRowsResponse(BaseModel):
    imported: int

class MarkRecountRequest(BaseModel):
    line_ids: list[int]


class RecountCreateRequest(BaseModel):
    parent_document_id: int
    employees: list[int] = []
    line_ids: list[int]


class RecountCreateResponse(BaseModel):
    document: ReceiveRead
    lines: list[ReceiveLineRead]

class ReceiveLineQuantityUpdate(BaseModel):
    expected_qty: int | None = Field(default=None, ge=0)
    counted_qty: int | None = Field(default=None, ge=0)
    recount_qty: int | None = Field(default=None, ge=0)