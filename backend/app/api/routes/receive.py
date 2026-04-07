# backend/app/api/routes/receive.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.models.models import Receive, ReceiveLine
from app.models.enums import ReceiveStatus, DocumentModule, AssignmentRole
from app.schemas.receives import (
    ReceiveCreate,
    ReceiveRead,
    ReceiveStatusUpdate,
    ReceiveLineCreate,
    ReceiveLineRead,
    ReceiveLineUpdate,
    ImportRowsResponse
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

    obj.status = payload.new_status

    db.add(obj)
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
    print(rows)
    get_or_404(db, Receive, receive_id)

    created = 0

    for row in rows:

        line = ReceiveLine(
            document_id=receive_id,
            **row.model_dump()
        )

        db.add(line)
        created += 1

    db.commit()

    return {"imported": created}