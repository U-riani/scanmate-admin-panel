# backend/app/api/routes/inventorization.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.enums import (
    InventorizationStatus,
    DocumentModule,
    ScanType,
    AssignmentRole,
    AssignmentStatus,
)

from app.models.models import (
    Inventorization,
    InventorizationLine,
    WarehouseProduct,
    PocketUser,
    DocumentAssignment,
)
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
    InventorizationLineQuantityUpdate
)
from app.services.document_assignments import create_document_assignments_for_document
from app.api.deps import get_current_pocket_user
from app.services.utils import get_or_404

router = APIRouter()


@router.get("", response_model=list[InventorizationRead])
def list_docs(db: Session = Depends(get_db)):
    return db.scalars(
        select(Inventorization).order_by(Inventorization.id.desc())
    ).all()


@router.post("", response_model=InventorizationCreate)
def create_doc(payload: InventorizationCreate, db: Session = Depends(get_db)):
    obj = Inventorization(
        **payload.model_dump(),
        status=InventorizationStatus.draft,
    )
    db.add(obj)
    db.flush()

    create_document_assignments_for_document(
        db=db,
        module=DocumentModule.inventorization,
        document_id=obj.id,
        user_ids=payload.employees or [],
        role=AssignmentRole.worker,
    )

    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{doc_id}/status", response_model=InventorizationRead)
def update_status(doc_id: int, payload: InventorizationStatusUpdate, db: Session = Depends(get_db)):
    print("got request from admin")
    obj = get_or_404(db, Inventorization, doc_id, "Document not found")

    prev_status = (
        obj.status.value if hasattr(obj.status, "value") else str(obj.status)
    )
    new_status = (
        payload.new_status.value if hasattr(payload.new_status, "value") else str(payload.new_status)
    )

    obj.status = payload.new_status
    db.add(obj)

    if (
            prev_status == InventorizationStatus.scanning_completed.value
            and new_status == InventorizationStatus.recount_requested.value
    ):
        now = datetime.utcnow()
        recount_user_ids = set(obj.recount_user_ids or obj.employees or [])

        assignments = db.scalars(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.inventorization,
                DocumentAssignment.document_id == doc_id,
                DocumentAssignment.role == AssignmentRole.worker,
            )
        ).all()

        for assignment in assignments:
            if assignment.pocket_user_id in recount_user_ids:
                if assignment.status in (
                        AssignmentStatus.scanning_completed,
                        AssignmentStatus.completed,
                        AssignmentStatus.recount_completed,
                ):
                    assignment.status = AssignmentStatus.recount_requested
                    assignment.recount_requested_at = now
                    assignment.recount_started_at = None
                    assignment.recount_completed_at = None
                    db.add(assignment)
            else:
                if assignment.status in (
                        AssignmentStatus.scanning_completed,
                        AssignmentStatus.completed,
                        AssignmentStatus.recount_requested,
                        AssignmentStatus.recount_in_progress,
                ):
                    assignment.status = AssignmentStatus.recount_completed
                    assignment.recount_completed_at = now
                    db.add(assignment)

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


@router.patch("/lines/{line_id}/quantity", response_model=InventorizationLineRead)
def update_line_quantity(
    line_id: int,
    payload: InventorizationLineQuantityUpdate,
    db: Session = Depends(get_db),
):
    line = get_or_404(db, InventorizationLine, line_id, "Line not found")

    doc = get_or_404(
        db,
        Inventorization,
        line.document_id,
        "Document not found",
    )

    allowed_statuses = {
        InventorizationStatus.draft,
        InventorizationStatus.scanning_completed,
        InventorizationStatus.recount_completed,
        InventorizationStatus.confirmed,
    }

    if doc.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Quantity update is not allowed for this document status",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No quantity field provided",
        )

    allowed_fields = {"expected_qty", "counted_qty", "recount_qty"}

    for field, value in update_data.items():
        if field not in allowed_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field}' cannot be updated",
            )

        if field == "expected_qty" and value is None:
            raise HTTPException(
                status_code=400,
                detail="expected_qty cannot be empty",
            )

        if value is not None and value < 0:
            raise HTTPException(
                status_code=400,
                detail=f"{field} must be zero or a positive number",
            )

        setattr(line, field, value)

    db.add(line)
    db.commit()
    db.refresh(line)

    return line


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

        scanned_qty = int(row.get("scanned_qty") or 0)
        recounted_qty = int(row.get("recounted_qty") or 0)

        line = InventorizationLine(
            document_id=doc_id,
            barcode=barcode,
            article_code=row.get("article_code") or "",
            product_name=row.get("product_name") or "",
            color=row.get("color") or "",
            size=row.get("size") or "",
            price=float(row.get("price")) or 0,
            expected_qty=int(row.get("initial_qty") or 0),
            base_counted_qty=scanned_qty,
            base_recount_qty=recounted_qty,
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
    doc = get_or_404(db, Inventorization, payload.parent_document_id, "Document not found")

    if not payload.employees:
        raise HTTPException(status_code=400, detail="Select at least 1 employee for recount")

    allowed_user_ids = set(doc.employees or [])
    selected_user_ids = list(dict.fromkeys(payload.employees))

    invalid_user_ids = [uid for uid in selected_user_ids if uid not in allowed_user_ids]
    if invalid_user_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid recount employees: {invalid_user_ids}"
        )

    lines = db.scalars(
        select(InventorizationLine).where(
            InventorizationLine.document_id == payload.parent_document_id,
            InventorizationLine.id.in_(payload.line_ids),
        )
    ).all()

    if not lines:
        return {
            "document": doc,
            "lines": []
        }

    doc.recount_user_ids = selected_user_ids
    db.add(doc)

    for line in lines:
        line.recount_requested = True
        line.recount_qty = 0
        db.add(line)

    db.commit()
    db.refresh(doc)

    for line in lines:
        db.refresh(line)

    return {
        "document": doc,
        "lines": lines
    }