from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import ORMModel
from app.models.enums import DocumentModule, ScanType


class TransferCreate(BaseModel):
    name: str
    number: str | None = None
    from_warehouse_id: int
    to_warehouse_id: int
    module: DocumentModule
    scan_type: ScanType
    sender_user_ids: list[int] = []
    receiver_user_ids: list[int] = []
    created_by: int | None = None


class TransferStatusUpdate(BaseModel):
    status: str


class TransferSignRequest(BaseModel):
    user_id: int


class TransferRead(ORMModel):
    id: int
    name: str
    number: str | None = None
    from_warehouse_id: int
    to_warehouse_id: int
    module: DocumentModule
    scan_type: ScanType
    status: str
    sender_user_ids: list[int] = []
    receiver_user_ids: list[int] = []
    sender_finished_at: datetime | None = None
    receiver_finished_at: datetime | None = None
    signature_status: str
    signed_by_user_id: int | None = None
    signed_at: datetime | None = None
    created_by: int | None = None
    created_at: datetime
    updated_at: datetime
    total_lines: int
    sent_lines: int
    received_lines: int
    difference_lines: int
    is_locked: bool
    closed_at: datetime | None = None


class TransferLineBase(BaseModel):
    product_id: int | None = None
    barcode: str
    article_code: str | None = None
    product_name: str | None = None
    expected_qty: int = 0


class TransferLineCreate(TransferLineBase):
    pass


class TransferLineUpdate(BaseModel):
    expected_qty: int | None = None
    sent_qty: int | None = None
    received_qty: int | None = None


class TransferLineRead(ORMModel):
    id: int
    document_id: int
    product_id: int | None = None
    barcode: str
    article_code: str | None = None
    product_name: str | None = None
    expected_qty: int
    sent_qty: int
    received_qty: int
    difference_qty: int
    sender_user_id: int | None = None
    receiver_user_id: int | None = None
    sender_scanned_at: datetime | None = None
    receiver_scanned_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class ImportRowsResponse(BaseModel):
    imported: int