from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import InventorizationStatus, DocumentModule, ScanType
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


@router.get("", response_model=list[InventorizationRead])
def list_docs(db: Session = Depends(get_db)):
    return db.scalars(
        select(Inventorization).order_by(Inventorization.id.desc())
    ).all()


@router.post("", response_model=InventorizationRead)
def create_doc(payload: InventorizationCreate, db: Session = Depends(get_db)):
    print("---", payload)
    obj = Inventorization(
        **payload.model_dump(),
        status=InventorizationStatus.draft,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{doc_id}/status", response_model=InventorizationRead)
def update_status(doc_id: int, payload: InventorizationStatusUpdate, db: Session = Depends(get_db)):
    print("got request from admin")
    obj = get_or_404(db, Inventorization, doc_id, "Document not found")

    obj.status = payload.status

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj

# # send inventorization docs data(not lines)
# @router.get("/pocket/inventorizations", response_model=list[InventorizationRead])
# def pocket_documents(
#     current_user: PocketUser = Depends(get_current_pocket_user),
#     db: Session = Depends(get_db)
# ):
#     print("got request from pocket")
#     docs = db.scalars(
#         select(Inventorization)
#         .where(Inventorization.warehouse_id.in_(current_user.warehouses))
#         .order_by(Inventorization.id.desc())
#     ).all()
#
#     assigned_docs = []
#
#     for doc in docs:
#         if current_user.id in (doc.employees or []):
#             assigned_docs.append(doc)
#
#     return assigned_docs


@router.get("/{doc_id}/lines", response_model=list[InventorizationLineRead])
def list_lines(doc_id: int, db: Session = Depends(get_db)):
    return db.scalars(
        select(InventorizationLine)
        .where(InventorizationLine.document_id == doc_id)
        .order_by(InventorizationLine.id)
    ).all()





@router.post("/{doc_id}/preload-lines", response_model=list[InventorizationLineRead])
def preload_lines(doc_id: int, payload: PreloadLinesRequest, db: Session = Depends(get_db)):

    get_or_404(db, Inventorization, doc_id, "Document not found")

    products = db.scalars(
        select(WarehouseProduct).where(
            WarehouseProduct.warehouse_id == payload.warehouse_id
        )
    ).all()

    created = []
    print(products)
    for p in products:
        line = InventorizationLine(
            document_id=doc_id,
            barcode=p.barcode,
            article_code=p.article_code,
            product_name=p.product_name,
            color=p.color,
            size=p.size,
            price=p.price,
            expected_qty=p.stock_qty,
        )
        db.add(line)
        created.append(line)

    db.commit()

    for line in created:
        db.refresh(line)

    return created


@router.post("/{doc_id}/import-lines", response_model=ImportRowsResponse)
def import_lines(doc_id: int, payload: ImportRowsRequest, db: Session = Depends(get_db)):

    get_or_404(db, Inventorization, doc_id, "Document not found")

    errors = []
    imported = 0
    for index, row in enumerate(payload.rows):

        barcode = str(row.get("barcode") or "").strip()

        if not barcode:
            errors.append({"row": index + 2, "reason": "Barcode missing"})
            continue

        line = InventorizationLine(
            document_id=doc_id,
            barcode=barcode,
            article_code=row.get("article_code") or "",
            product_name=row.get("product_name") or "",
            color=row.get("color") or "",
            size=row.get("size") or "",
            price=float(row.get("price")) or 0,
            expected_qty=int(row.get("initial_qty") or 0),
            counted_qty=int(row.get("scanned_qty") or 0),
            recount_qty=int(row.get("recounted_qty") or 0),
            box_id=row.get("box_id") or "",
        )
        print(line)
        db.add(line)
        imported += 1

    db.commit()

    return {"imported": imported, "errors": errors}


@router.post("/recount", response_model=RecountCreateResponse)
def create_recount(payload: RecountCreateRequest, db: Session = Depends(get_db)):
    doc = Inventorization(
        name=f"Recount for {payload.parent_document_id}",
        warehouse_id=payload.warehouse_id,
        module=DocumentModule.inventorization,
        scan_type=ScanType.barcode,
        parent_document_id=payload.parent_document_id,
        status=InventorizationStatus.draft,
        description=payload.description,
        employees=payload.employees,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    created = []

    for item in payload.items:

        line = InventorizationLine(
            document_id=doc.id,
            barcode=item.barcode,
            article_code=item.article_code,
            product_name=item.product_name,
            expected_qty=item.counted_qty or 0,
            counted_qty=None,
            recount_qty=None,
            employee_id=None,
        )

        db.add(line)
        created.append(line)

    db.commit()

    for line in created:
        db.refresh(line)

    return {"document": doc, "lines": created}