# backend/app/api/routes/transfers.py

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentModule,SignatureStatus, TransferStatus, AssignmentStatus, AssignmentRole
from app.models.models import Transfer, TransferLine, DocumentAssignment
from app.schemas.transfers import (
    TransferCreate,
    TransferLineCreate,
    TransferLineRead,
    TransferLineUpdate,
    TransferRead,
    TransferSignRequest,
    TransferStatusUpdate,
    ImportRowsResponse,
    TransferRecountCreateRequest,
    TransferRecountCreateResponse,
    TransferLineQuantityUpdate
)
from app.services.transfers import recalc_transfer_stats
from app.services.document_assignments import create_transfer_assignments
from app.services.utils import get_or_404

router = APIRouter()


@router.get("", response_model=list[TransferRead])
def list_transfers(db: Session = Depends(get_db)):
    return db.scalars(select(Transfer).order_by(Transfer.id.desc())).all()


@router.post("", response_model=TransferRead)
def create_transfer(payload: TransferCreate, db: Session = Depends(get_db)):
    obj = Transfer(
        **payload.model_dump(),
        status=TransferStatus.draft,
        signature_status=SignatureStatus.pending,
    )
    db.add(obj)
    db.flush()

    create_transfer_assignments(
        db=db,
        document_id=obj.id,
        sender_user_ids=payload.sender_user_ids or [],
        receiver_user_ids=payload.receiver_user_ids or [],
    )

    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{transfer_id}/status", response_model=TransferRead)
def update_status(transfer_id: int, payload: TransferStatusUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Transfer, transfer_id, "Transfer not found")
    print('payload', payload)
    prev_status = (
        obj.status.value if hasattr(obj.status, "value") else str(obj.status)
    )
    new_status = (
        payload.new_status.value if hasattr(payload.new_status, "value") else str(payload.new_status)
    )

    obj.status = payload.new_status
    db.add(obj)

    now = datetime.utcnow()

    # sender recount
    if (
        prev_status == TransferStatus.sender_completed.value
        and new_status == TransferStatus.sender_recount_requested.value
    ):
        recount_user_ids = set(obj.sender_recount_user_ids or obj.sender_user_ids or [])

        assignments = db.scalars(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.transfer,
                DocumentAssignment.document_id == transfer_id,
                DocumentAssignment.role == AssignmentRole.sender,
            )
        ).all()

        for assignment in assignments:
            if assignment.pocket_user_id in recount_user_ids:
                if assignment.status in (
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
                    AssignmentStatus.completed,
                    AssignmentStatus.recount_requested,
                    AssignmentStatus.recount_in_progress,
                ):
                    assignment.status = AssignmentStatus.recount_completed
                    assignment.recount_completed_at = now
                    db.add(assignment)

    # receiver recount
    if (
        prev_status == TransferStatus.receive_completed.value
        and new_status == TransferStatus.receive_recount_requested.value
    ):
        recount_user_ids = set(obj.receiver_recount_user_ids or obj.receiver_user_ids or [])

        assignments = db.scalars(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.transfer,
                DocumentAssignment.document_id == transfer_id,
                DocumentAssignment.role == AssignmentRole.receiver,
            )
        ).all()

        for assignment in assignments:
            if assignment.pocket_user_id in recount_user_ids:
                if assignment.status in (
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

@router.post("/{doc_id}/import-lines", response_model=ImportRowsResponse)
def import_lines(doc_id: int, payload: list[dict], db: Session = Depends(get_db)):

    get_or_404(db, Transfer, doc_id, "Transfer not found")

    created = []

    for row in payload:
        sent_qty = int(row.get("Scanned_Quantity") or 0)
        received_qty = int(row.get("Received_Quantity") or 0)
        sender_recounted_qty = int(row.get("Sender_Recounted_Quantity") or 0)
        receiver_recounted_qty = int(row.get("Receiver_Recounted_Quantity") or 0)

        line = TransferLine(
            document_id=doc_id,
            barcode=row.get("Barcode"),
            article_code=row.get("ArticCode"),
            product_name=row.get("Name"),
            color=row.get("Color"),
            size=row.get("Size"),
            price=float(row.get("Price") or 0),
            expected_qty=int(row.get("Initial_Quantity") or 0),

            base_sent_qty=int(row.get("Scanned_Quantity") or 0),
            base_received_qty=int(row.get("Received_Quantity") or 0),

            base_sender_recount_qty=sender_recounted_qty,
            base_receiver_recount_qty=receiver_recounted_qty,

            sent_qty=int(row.get("Scanned_Quantity") or 0),
            received_qty=int(row.get("Received_Quantity") or 0),

            sender_recounted_qty=sender_recounted_qty,
            receiver_recounted_qty=receiver_recounted_qty,

            box_id=row.get("Box_Id"),
        )

        db.add(line)
        created.append(line)

    db.commit()

    recalc_transfer_stats(db, doc_id)
    db.commit()

    return {"imported": len(created)}


@router.get("/{doc_id}/lines", response_model=list[TransferLineRead])
def list_lines(doc_id: int, db: Session = Depends(get_db)):
    return db.scalars(
        select(TransferLine)
        .where(TransferLine.document_id == doc_id)
        .order_by(TransferLine.id)
    ).all()

@router.patch("/lines/{line_id}/quantity", response_model=TransferLineRead)
def update_line_quantity(
    line_id: int,
    payload: TransferLineQuantityUpdate,
    db: Session = Depends(get_db),
):
    line = get_or_404(db, TransferLine, line_id, "Transfer line not found")

    doc = get_or_404(
        db,
        Transfer,
        line.document_id,
        "Transfer not found",
    )

    allowed_statuses = {
        TransferStatus.draft,
        TransferStatus.sender_completed,
        TransferStatus.sender_recount_completed,
        TransferStatus.receive_completed,
        TransferStatus.receive_recount_completed,
        TransferStatus.closed,
    }

    if doc.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Quantity update is not allowed for this transfer status",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No quantity field provided",
        )

    allowed_fields = {
        "expected_qty",
        "sent_qty",
        "received_qty",
        "sender_recounted_qty",
        "receiver_recounted_qty",
    }

    for field, value in update_data.items():
        if field not in allowed_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Field '{field}' cannot be updated",
            )

        if value is None:
            raise HTTPException(
                status_code=400,
                detail=f"{field} cannot be empty",
            )

        if value < 0:
            raise HTTPException(
                status_code=400,
                detail=f"{field} must be zero or a positive number",
            )

        setattr(line, field, value)

    line.difference_qty = line.sent_qty - line.received_qty

    db.add(line)
    db.commit()

    recalc_transfer_stats(db, doc.id)
    db.commit()

    db.refresh(line)

    return line

@router.patch("/{transfer_id}/sign", response_model=TransferRead)
def sign_transfer(transfer_id: int, payload: TransferSignRequest, db: Session = Depends(get_db)):

    obj = get_or_404(db, Transfer, transfer_id, "Transfer not found")

    obj.signature_status = SignatureStatus.confirmed
    obj.signed_by_user_id = payload.user_id
    obj.signed_at = datetime.now(timezone.utc)

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


@router.post("/recount", response_model=TransferRecountCreateResponse)
def create_recount(payload: TransferRecountCreateRequest, db: Session = Depends(get_db)):
    doc = get_or_404(db, Transfer, payload.parent_document_id, "Transfer not found")

    if payload.role not in ("sender", "receiver"):
        raise HTTPException(status_code=400, detail="Role must be 'sender' or 'receiver'")

    if not payload.employees:
        raise HTTPException(status_code=400, detail="Select at least 1 employee for recount")

    allowed_user_ids = set(
        doc.sender_user_ids if payload.role == "sender" else doc.receiver_user_ids
    )
    selected_user_ids = list(dict.fromkeys(payload.employees))

    invalid_user_ids = [uid for uid in selected_user_ids if uid not in allowed_user_ids]
    if invalid_user_ids:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid recount employees for role '{payload.role}': {invalid_user_ids}"
        )

    lines = db.scalars(
        select(TransferLine).where(
            TransferLine.document_id == payload.parent_document_id,
            TransferLine.id.in_(payload.line_ids),
        )
    ).all()

    if not lines:
        return {
            "document": doc,
            "lines": []
        }

    if payload.role == "sender":
        doc.sender_recount_user_ids = selected_user_ids
    else:
        doc.receiver_recount_user_ids = selected_user_ids

    db.add(doc)

    for line in lines:
        if payload.role == "sender":
            line.sender_recount_requested = True
            line.sender_recounted_qty = 0
        else:
            line.receiver_recount_requested = True
            line.receiver_recounted_qty = 0

        db.add(line)

    db.commit()
    db.refresh(doc)

    for line in lines:
        db.refresh(line)

    return {
        "document": doc,
        "lines": lines
    }