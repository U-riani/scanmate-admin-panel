# backend/app/api/routes/receive.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.db.session import get_db
from app.models.models import Receive, ReceiveLine, DocumentAssignment
from app.models.enums import (
    ReceiveStatus,
    DocumentModule,
    AssignmentRole,
    AssignmentStatus,
)
from app.schemas.receives import (
    ReceiveCreate,
    ReceiveRead,
    ReceiveStatusUpdate,
    ReceiveLineCreate,
    ReceiveLineRead,
    ReceiveLineUpdate,
    ImportRowsResponse,
    RecountCreateRequest,
    RecountCreateResponse,
)

from app.services.document_assignments import create_document_assignments_for_document
from app.services.utils import get_or_404

router = APIRouter()


@router.get("", response_model=list[ReceiveRead])
def list_receives(db: Session = Depends(get_db)):
    return db.scalars(
        select(Receive).order_by(Receive.id.desc())
    ).all()


@router.post("", response_model=ReceiveRead)
def create_receive(payload: ReceiveCreate, db: Session = Depends(get_db)):
    obj = Receive(
        **payload.model_dump(),
        status=ReceiveStatus.draft,
    )
    db.add(obj)
    db.flush()

    create_document_assignments_for_document(
        db=db,
        module=DocumentModule.receive,
        document_id=obj.id,
        user_ids=payload.receiver_user_ids or [],
        role=AssignmentRole.worker,
    )

    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{receive_id}/status", response_model=ReceiveRead)
def update_status(receive_id: int, payload: ReceiveStatusUpdate, db: Session = Depends(get_db)):
    print("update status", receive_id, payload)
    obj = get_or_404(db, Receive, receive_id, "Receive not found")

    prev_status = (
        obj.status.value if hasattr(obj.status, "value") else str(obj.status)
    )
    new_status = (
        payload.new_status.value if hasattr(payload.new_status, "value") else str(payload.new_status)
    )

    obj.status = payload.new_status
    db.add(obj)

    if (
            prev_status == ReceiveStatus.scanning_completed.value
            and new_status == ReceiveStatus.recount_requested.value
    ):
        now = datetime.utcnow()
        recount_user_ids = set(obj.recount_user_ids or obj.receiver_user_ids or [])

        assignments = db.scalars(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.receive,
                DocumentAssignment.document_id == receive_id,
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

@router.get("/{receive_id}/lines", response_model=list[ReceiveLineRead])
def list_lines(receive_id: int, db: Session = Depends(get_db)):

    get_or_404(db, Receive, receive_id)

    return db.scalars(
        select(ReceiveLine)
        .where(ReceiveLine.document_id == receive_id)
    ).all()


@router.post("/{receive_id}/lines/import", response_model=ImportRowsResponse)
def import_lines(receive_id: int, rows: list[ReceiveLineCreate], db: Session = Depends(get_db)):
    get_or_404(db, Receive, receive_id)

    created = 0

    for row in rows:
        counted_qty = row.counted_qty or 0

        line = ReceiveLine(
            document_id=receive_id,
            barcode=row.barcode,
            article_code=row.article_code,
            product_name=row.product_name,
            color=row.color,
            size=row.size,
            price=row.price or 0,
            expected_qty=row.expected_qty or 0,

            base_counted_qty=counted_qty,
            base_recount_qty=0,

            counted_qty=counted_qty,
            recount_qty=0,

            box_id=row.box_id,
        )

        db.add(line)
        created += 1

    db.commit()
    return {"imported": created}

@router.post("/recount", response_model=RecountCreateResponse)
def create_recount(payload: RecountCreateRequest, db: Session = Depends(get_db)):
    doc = get_or_404(db, Receive, payload.parent_document_id, "Document not found")

    if not payload.employees:
        raise HTTPException(status_code=400, detail="Select at least 1 employee for recount")

    allowed_user_ids = set(doc.receiver_user_ids or [])
    selected_user_ids = list(dict.fromkeys(payload.employees))

    invalid_user_ids = [uid for uid in selected_user_ids if uid not in allowed_user_ids]
    if invalid_user_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid recount employees: {invalid_user_ids}"
        )

    lines = db.scalars(
        select(ReceiveLine).where(
            ReceiveLine.document_id == payload.parent_document_id,
            ReceiveLine.id.in_(payload.line_ids),
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