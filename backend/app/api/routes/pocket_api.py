#backend/app/api/routes/pocket_api.py

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentModule, InventorizationStatus
from app.models.models import Inventorization, InventorizationLine, WarehouseProduct, Warehouse, PocketUser, Transfer, Receive

from app.schemas.pocketApiSchema import PocketDocument, PocketDocumentLine
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


# send all docs data(not lines)
@router.get("/documents", response_model=list[PocketDocument])
def pocket_documents(
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db)
):
    print("got request from pocket")

    result = []

    # INVENTORIZATIONS
    inventorization_docs = db.scalars(
        select(Inventorization)
        .where(Inventorization.warehouse_id.in_(current_user.warehouses))
        .order_by(Inventorization.id.desc())
    ).all()

    for doc in inventorization_docs:
        if current_user.id in (doc.employees or []):
            result.append({
                "id": doc.id,
                "name": doc.name,
                "warehouse_id": doc.warehouse_id,
                "warehouse_name": doc.warehouse.name if doc.warehouse else None,
                "doc_module": "inventorization",
                "scan_type": doc.scan_type,
                "parent_document_id": doc.parent_document_id,
                "status": doc.status,
                "description": doc.description,
                "employees": doc.employees,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            })

    # TRANSFERS
    transfer_docs = db.scalars(
        select(Transfer)
        .where(
            Transfer.from_warehouse_id.in_(current_user.warehouses) |
            Transfer.to_warehouse_id.in_(current_user.warehouses)
        )
        .order_by(Transfer.id.desc())
    ).all()

    for doc in transfer_docs:
        from_wh = db.get(Warehouse, doc.from_warehouse_id)
        to_wh = db.get(Warehouse, doc.to_warehouse_id)

        result.append({
            "id": doc.id,
            "name": doc.name,

            "doc_module": "transfer",
            "scan_type": doc.scan_type,
            "status": doc.status,

            "from_warehouse_id": doc.from_warehouse_id,
            "from_warehouse_name": from_wh.name if from_wh else None,

            "to_warehouse_id": doc.to_warehouse_id,
            "to_warehouse_name": to_wh.name if to_wh else None,

            "warehouse_id": None,
            "warehouse_name": None,

            "parent_document_id": None,
            "description": doc.description,
            "employees": None,

            "created_at": doc.created_at,
            "updated_at": doc.updated_at
        })

    # RECEIVES
    receive_docs = db.scalars(
        select(Receive)
        .where(Receive.warehouse_id.in_(current_user.warehouses))
        .order_by(Receive.id.desc())
    ).all()

    for doc in receive_docs:
        wh = db.get(Warehouse, doc.warehouse_id)

        result.append({
            "id": doc.id,
            "name": doc.name,
            "warehouse_id": doc.warehouse_id,
            "warehouse_name": wh.name if wh else None,
            "doc_module": "receive",
            "scan_type": doc.scan_type,
            "parent_document_id": doc.parent_document_id,
            "status": doc.status,
            "description": doc.description,
            "employees": doc.employees,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at
        })
    return result

@router.get("/{doc_id}/lines", response_model=list[PocketDocumentLine])
def list_lines(doc_id: int, module: str, db: Session = Depends(get_db)):

    if module == "inventorization":
        lines = db.scalars(
            select(InventorizationLine)
            .where(InventorizationLine.document_id == doc_id)
            .order_by(InventorizationLine.id)
        ).all()

    elif module == "transfer":
        from app.models.models import TransferLine

        lines = db.scalars(
            select(TransferLine)
            .where(TransferLine.document_id == doc_id)
            .order_by(TransferLine.id)
        ).all()

    elif module == "receive":
        from app.models.models import ReceiveLine

        lines = db.scalars(
            select(ReceiveLine)
            .where(ReceiveLine.document_id == doc_id)
            .order_by(ReceiveLine.id)
        ).all()

    else:
        return []

    return lines