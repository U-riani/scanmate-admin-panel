from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import Transfer, TransferLine


def recalc_transfer_stats(db: Session, transfer_id: int):
    transfer = db.get(Transfer, transfer_id)
    lines = db.scalars(select(TransferLine).where(TransferLine.document_id == transfer_id)).all()
    transfer.total_lines = len(lines)
    transfer.sent_lines = sum(1 for line in lines if line.sent_qty > 0)
    transfer.received_lines = sum(1 for line in lines if line.received_qty > 0)
    transfer.difference_lines = sum(1 for line in lines if line.difference_qty != 0)
    db.add(transfer)
    db.flush()
    return transfer
