#backend/app/api/routes/pocket_api.py

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentType, InventorizationStatus
from app.models.models import Inventorization, InventorizationLine, WarehouseProduct, PocketUser
from app.schemas.inventorizations import (
    ImportRowsRequest,
    ImportRowsResponse,
    InventorizationCreate,
    InventorizationLineRead,
    InventorizationRead,
    InventorizationStatusUpdate,
    PreloadLinesRequest,
    RecountCreateRequest,
    RecountCreateResponse,
)
from app.api.deps import get_current_pocket_user
from app.services.utils import get_or_404

router = APIRouter()


# send inventorization docs data(not lines)
@router.get("/documents", response_model=list[InventorizationRead])
def pocket_documents(
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db)
):
    print("got request from pocket")

    docs = db.scalars(
        select(Inventorization)
        .where(Inventorization.warehouse_id.in_(current_user.warehouses))
        .order_by(Inventorization.id.desc())
    ).all()

    assigned_docs = []

    for doc in docs:
        if current_user.id in (doc.employees or []):
            assigned_docs.append({
                "id": doc.id,
                "name": doc.name,
                "warehouse_id": doc.warehouse_id,
                "warehouse_name": doc.warehouse.name if doc.warehouse else None,
                "type": doc.type,
                "doc_type": doc.doc_type,
                "parent_document_id": doc.parent_document_id,
                "status": doc.status,
                "description": doc.description,
                "employees": doc.employees,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            })

    return assigned_docs