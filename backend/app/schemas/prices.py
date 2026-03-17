from datetime import datetime
from pydantic import BaseModel
from app.schemas.common import ORMModel


class PriceUploadCreate(BaseModel):
    warehouse_id: int
    file_name: str | None = None
    uploaded_by: int | None = None
    rows: list[dict] = []
    notes: str | None = None


class PriceUploadRead(ORMModel):
    id: int
    warehouse_id: int
    file_name: str | None = None
    uploaded_by: int | None = None
    uploaded_at: datetime
    rows_count: int
    valid_rows_count: int
    error_rows_count: int
    duplicate_count: int
    status: str
    notes: str | None = None


class PriceRowRead(ORMModel):
    id: int
    upload_id: int
    warehouse_id: int
    barcode: str
    name: str | None = None
    category: str | None = None
    color: str | None = None
    size: str | None = None
    group_name: str | None = None
    article: str | None = None
    base_price: float
    adjusted_price: float
    price_type: str


class AddPriceRowsRequest(BaseModel):
    rows: list[dict]


class PriceUploadCreateResponse(BaseModel):
    upload: PriceUploadRead
    rows: list[PriceRowRead]
    errors: list[dict]


class PriceLookupResponse(BaseModel):
    found: bool
    barcode: str
    warehouse_id: int
    reason: str | None = None
    base_price: float | None = None
    adjusted_price: float | None = None
    price_type: str | None = None
    article: str | None = None
    name: str | None = None
