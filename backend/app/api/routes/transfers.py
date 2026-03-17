from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import SignatureStatus, TransferStatus
from app.models.models import Transfer, TransferLine
from app.schemas.transfers import TransferCreate, TransferLineCreate, TransferLineRead, TransferLineUpdate, TransferRead, TransferSignRequest, TransferStatusUpdate
from app.services.transfers import recalc_transfer_stats
from app.services.utils import get_or_404

router = APIRouter()

@router.get('', response_model=list[TransferRead])
def list_transfers(db: Session = Depends(get_db)):
    return db.scalars(select(Transfer).order_by(Transfer.id.desc())).all()

@router.post('', response_model=TransferRead)
def create_transfer(payload: TransferCreate, db: Session = Depends(get_db)):
    obj = Transfer(**payload.model_dump(), status=TransferStatus.draft, signature_status=SignatureStatus.pending)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch('/{transfer_id}/status', response_model=TransferRead)
def update_status(transfer_id: int, payload: TransferStatusUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Transfer, transfer_id, 'Transfer not found')
    obj.status = payload.status
    if payload.status == 'closed':
        obj.is_locked = True
        obj.closed_at = datetime.now(timezone.utc)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch('/{transfer_id}/sign', response_model=TransferRead)
def sign_transfer(transfer_id: int, payload: TransferSignRequest, db: Session = Depends(get_db)):
    obj = get_or_404(db, Transfer, transfer_id, 'Transfer not found')
    obj.signature_status = SignatureStatus.confirmed
    obj.signed_by_user_id = payload.user_id
    obj.signed_at = datetime.now(timezone.utc)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get('/{transfer_id}/lines', response_model=list[TransferLineRead])
def list_lines(transfer_id: int, db: Session = Depends(get_db)):
    return db.scalars(select(TransferLine).where(TransferLine.document_id == transfer_id).order_by(TransferLine.id)).all()

@router.post('/{transfer_id}/lines', response_model=list[TransferLineRead])
def add_lines(transfer_id: int, payload: list[TransferLineCreate], db: Session = Depends(get_db)):
    get_or_404(db, Transfer, transfer_id, 'Transfer not found')
    created = []
    for item in payload:
        obj = TransferLine(document_id=transfer_id, **item.model_dump())
        db.add(obj)
        created.append(obj)
    db.commit()
    recalc_transfer_stats(db, transfer_id)
    db.commit()
    for obj in created:
        db.refresh(obj)
    return created

@router.put('/lines/{line_id}', response_model=TransferLineRead)
def update_line(line_id: int, payload: TransferLineUpdate, db: Session = Depends(get_db)):
    line = get_or_404(db, TransferLine, line_id, 'Transfer line not found')
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(line, k, v)
    line.difference_qty = (line.received_qty or 0) - (line.sent_qty or 0)
    db.add(line)
    db.commit()
    recalc_transfer_stats(db, line.document_id)
    db.commit()
    db.refresh(line)
    return line

@router.delete('/lines/{line_id}')
def delete_line(line_id: int, db: Session = Depends(get_db)):
    line = get_or_404(db, TransferLine, line_id, 'Transfer line not found')
    transfer_id = line.document_id
    db.delete(line)
    db.commit()
    recalc_transfer_stats(db, transfer_id)
    db.commit()
    return {'success': True}
