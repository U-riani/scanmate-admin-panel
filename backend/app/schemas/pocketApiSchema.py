from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PocketDocument(BaseModel):
    id: int
    name: str

    doc_module: str
    scan_type: str
    status: str

    warehouse_id: Optional[int] = None
    warehouse_name: Optional[str] = None

    from_warehouse_id: Optional[int] = None
    from_warehouse_name: Optional[str] = None

    to_warehouse_id: Optional[int] = None
    to_warehouse_name: Optional[str] = None

    parent_document_id: Optional[int] = None
    description: Optional[str] = None
    employees: Optional[List[int]] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PocketDocumentLine(BaseModel):
    id: int
    document_id: int

    barcode: str
    article_code: Optional[str] = None
    product_name: Optional[str] = None

    color: Optional[str] = None
    size: Optional[str] = None

    price: Optional[float] = None
    box_id: Optional[str] = None

    expected_qty: int
    counted_qty: Optional[int] = None

    employee_id: Optional[int] = None

    class Config:
        from_attributes = True

class PocketStatusChangeRequest(BaseModel):
    status: str
    role: str | None = None