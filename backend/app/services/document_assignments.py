# backend/app/services/document_assignments.py

from sqlalchemy.orm import Session

from app.models.enums import (
    DocumentModule,
    AssignmentRole,
    AssignmentStatus,
)
from app.models.models import DocumentAssignment


def create_document_assignments_for_document(
    db: Session,
    module: DocumentModule,
    document_id: int,
    user_ids: list[int],
    role: AssignmentRole,
):
    if not user_ids:
        return

    assignments = []
    for user_id in user_ids:
        assignments.append(
            DocumentAssignment(
                document_module=module,
                document_id=document_id,
                pocket_user_id=user_id,
                role=role,
                status=AssignmentStatus.waiting_to_start,
            )
        )

    db.add_all(assignments)


def create_transfer_assignments(
    db: Session,
    document_id: int,
    sender_user_ids: list[int],
    receiver_user_ids: list[int],
):
    assignments = []

    for user_id in sender_user_ids or []:
        assignments.append(
            DocumentAssignment(
                document_module=DocumentModule.transfer,
                document_id=document_id,
                pocket_user_id=user_id,
                role=AssignmentRole.sender,
                status=AssignmentStatus.waiting_to_start,
            )
        )

    for user_id in receiver_user_ids or []:
        assignments.append(
            DocumentAssignment(
                document_module=DocumentModule.transfer,
                document_id=document_id,
                pocket_user_id=user_id,
                role=AssignmentRole.receiver,
                status=AssignmentStatus.waiting_to_start,
            )
        )

    if assignments:
        db.add_all(assignments)