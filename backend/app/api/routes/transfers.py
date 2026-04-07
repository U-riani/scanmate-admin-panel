# backend/app/api/routes/transfers.py

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import SignatureStatus, TransferStatus
from app.models.models import Transfer, TransferLine
from app.schemas.transfers import (
    TransferCreate,
    TransferLineCreate,
    TransferLineRead,
    TransferLineUpdate,
    TransferRead,
    TransferSignRequest,
    TransferStatusUpdate,
    ImportRowsResponse
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
    obj.status = payload.new_status

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj

@router.post("/{doc_id}/import-lines", response_model=ImportRowsResponse)
def import_lines(doc_id: int, payload: list[dict], db: Session = Depends(get_db)):

    get_or_404(db, Transfer, doc_id, "Transfer not found")

    created = []

    for row in payload:

        line = TransferLine(
            document_id=doc_id,
            barcode=row.get("Barcode"),
            article_code=row.get("ArticCode"),
            product_name=row.get("Name"),
            color=row.get("Color"),
            size=row.get("Size"),
            price=float(row.get("Price") or 0),
            expected_qty=int(row.get("Initial_Quantity") or 0),
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