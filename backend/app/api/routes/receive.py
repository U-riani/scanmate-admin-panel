from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import ReceiveStatus
from app.models.models import Receive, ReceiveLine
from app.schemas.receives import (
    ReceiveCreate,
    ReceiveLineCreate,
    ReceiveLineRead,
    ReceiveLineUpdate,
    ReceiveRead,
    ReceiveStatusUpdate,
)
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
        status=TransferStatus.draft,
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


@router.patch("/{receive_id}/status", response_model=ReceiveRead)
def update_status(
    receive_id: int,
    payload: ReceiveStatusUpdate,
    db: Session = Depends(get_db),
):

    obj = get_or_404(db, Receive, receive_id, "Receive document not found")

    obj.status = payload.status

    if payload.status == ReceiveStatus.closed:
        obj.is_locked = True
        obj.closed_at = datetime.now(timezone.utc)

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj

@router.get("/{receive_id}/lines", response_model=list[ReceiveLineRead])
def list_lines(receive_id: int, db: Session = Depends(get_db)):

    get_or_404(db, Receive, receive_id, "Receive document not found")

    return db.scalars(
        select(ReceiveLine)
        .where(ReceiveLine.document_id == receive_id)
        .order_by(ReceiveLine.id)
    ).all()

@router.post("/{receive_id}/lines", response_model=ReceiveLineRead)
def create_line(
    receive_id: int,
    payload: ReceiveLineCreate,
    db: Session = Depends(get_db),
):

    get_or_404(db, Receive, receive_id, "Receive document not found")

    line = ReceiveLine(
        document_id=receive_id,
        **payload.model_dump(),
    )

    db.add(line)
    db.commit()
    db.refresh(line)

    return line

@router.patch("/lines/{line_id}", response_model=ReceiveLineRead)
def update_line(
    line_id: int,
    payload: ReceiveLineUpdate,
    db: Session = Depends(get_db),
):

    line = get_or_404(db, ReceiveLine, line_id, "Receive line not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(line, field, value)

    db.add(line)
    db.commit()
    db.refresh(line)

    return line

@router.delete("/lines/{line_id}")
def delete_line(line_id: int, db: Session = Depends(get_db)):

    line = get_or_404(db, ReceiveLine, line_id, "Receive line not found")

    db.delete(line)
    db.commit()

    return {"success": True}