from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import ORMModel
from app.models.enums import DocumentModule, ScanType



class InventorizationCreate(BaseModel):
    name: str
    warehouse_id: int
    module: DocumentModule = DocumentModule.inventorization
    scan_type: ScanType
    description: str | None = None
    employees: list[int] = []

class InventorizationStatusUpdate(BaseModel):
    status: str


class InventorizationRead(ORMModel):
    id: int
    name: str
    warehouse_id: int
    warehouse_name: str | None = None

    module: DocumentModule
    scan_type: ScanType

    parent_document_id: int | None = None
    status: str
    description: str | None = None
    employees: list[int] = []

    created_at: datetime
    updated_at: datetime


class InventorizationLineCreate(BaseModel):
    barcode: str
    article_code: str | None = None
    product_name: str | None = None
    expected_qty: int = 0
    counted_qty: int | None = None


class InventorizationLineRead(ORMModel):
    id: int
    document_id: int
    barcode: str
    article_code: str | None = None
    product_name: str | None = None
    color: str | None = None
    size: str | None = None
    price: float | None = None
    box_id: str | None = None
    expected_qty: int
    counted_qty: int | None = None
    recount_qty: int | None = None
    recount_requested: bool
    employee_id: int | None = None


class PreloadLinesRequest(BaseModel):
    warehouse_id: int


class ImportRowsRequest(BaseModel):
    rows: list[dict]


class ImportRowsResponse(BaseModel):
    imported: int
    errors: list[dict]


class MarkRecountRequest(BaseModel):
    line_ids: list[int]


class RecountCreateRequest(BaseModel):
    parent_document_id: int
    warehouse_id: int
    employees: list[int] = []
    items: list[InventorizationLineRead]


class RecountCreateResponse(BaseModel):
    document: InventorizationRead
    lines: list[InventorizationLineRead]
