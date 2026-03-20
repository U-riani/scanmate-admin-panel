from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import PriceType, PriceUploadStatus
from app.models.models import PriceRow, PriceUpload
from app.schemas.prices import (
    AddPriceRowsRequest,
    PriceLookupResponse,
    PriceRowRead,
    PriceUploadCreate,
    PriceUploadCreateResponse,
    PriceUploadRead,
)
from app.services.utils import get_or_404

router = APIRouter()


def get_price_type(base_price: float, adjusted_price: float) -> PriceType:
    if adjusted_price < base_price:
        return PriceType.discounted
    if adjusted_price > base_price:
        return PriceType.markup
    return PriceType.none


def normalize_rows(rows: list[dict]):
    errors = []
    seen = {}
    duplicate_count = 0

    for index, row in enumerate(rows):

        barcode = str(row.get("barcode") or "").strip()

        if not barcode:
            errors.append({"row": index + 1, "reason": "Barcode required"})
            continue

        try:
            base_price = float(row.get("base_price"))
            adjusted_price = float(row.get("adjusted_price"))
        except:
            errors.append({"row": index + 1, "reason": "Invalid price"})
            continue

        data = {
            "barcode": barcode,
            "name": row.get("name"),
            "category": row.get("category"),
            "color": row.get("color"),
            "size": row.get("size"),
            "group_name": row.get("group_name"),
            "article": row.get("article"),
            "base_price": base_price,
            "adjusted_price": adjusted_price,
            "price_type": get_price_type(base_price, adjusted_price),
        }

        if barcode in seen:
            duplicate_count += 1

        seen[barcode] = data

    return list(seen.values()), errors, duplicate_count