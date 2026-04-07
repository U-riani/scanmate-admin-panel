#backend/app/api/routes/pocket_api.py

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentModule, InventorizationStatus, ReceiveStatus, TransferStatus, AssignmentStatus, AssignmentRole
from app.models.models import Inventorization, InventorizationLine, WarehouseProduct, Warehouse, PocketUser, Transfer, Receive, DocumentAssignment

from app.schemas.pocketApiSchema import PocketDocument, PocketDocumentLine, PocketStatusChangeRequest
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

ALLOWED_POCKET_STATUSES_INVENTORIZATION_RECEIVE = [
    "waiting_to_start",
    "in_progress",
    "recount_requested",
    "recount_in_progress",
]

ALLOWED_POCKET_STATUSES_TRANSFER_SENDER = [
    "waiting_to_start",
    "sender_in_progress",
    "sender_recount_requested",
    "sender_recount_in_progress",
    "sender_recount_completed",
]

ALLOWED_POCKET_STATUSES_TRANSFER_RECEIVER = [
    "sender_recount_completed",
    "receive_in_progress",
    "receive_recount_requested",
    "receive_recount_in_progress",
]


def _get_next_assignment_status_on_load_data(module: str, document_status: str, role: str | None = None) -> str | None:
    if module in ("inventorization", "receive"):
        if document_status == "waiting_to_start":
            return "in_progress"
        if document_status == "recount_requested":
            return "recount_in_progress"
        return None

    if module == "transfer":
        if role == "sender":
            if document_status == "waiting_to_start":
                return "in_progress"
            if document_status == "sender_recount_requested":
                return "recount_in_progress"
            return None

        if role == "receiver":
            if document_status == "sender_recount_completed":
                return "in_progress"
            if document_status == "receive_recount_requested":
                return "recount_in_progress"
            return None

    return None

def _get_assignment_role_for_user(module: str, doc, current_user_id: int, requested_role: str | None) -> AssignmentRole:
    if module in ("inventorization", "receive"):
        return AssignmentRole.worker

    if module == "transfer":
        allowed_roles = []

        if current_user_id in (doc.sender_user_ids or []):
            allowed_roles.append(AssignmentRole.sender)

        if current_user_id in (doc.receiver_user_ids or []):
            allowed_roles.append(AssignmentRole.receiver)

        if not allowed_roles:
            raise ValueError("User is not assigned to this transfer")

        if len(allowed_roles) == 1:
            return allowed_roles[0]

        if not requested_role:
            raise ValueError("Role is required for users assigned as both sender and receiver")

        try:
            role = AssignmentRole(requested_role)
        except Exception:
            raise ValueError("Invalid role")

        if role not in allowed_roles:
            raise ValueError("Requested role is not allowed for this user")

        return role

    raise ValueError("Unsupported module")

def recalc_document_status(db: Session, module: str, document_id: int):
    assignments = db.scalars(
        select(DocumentAssignment)
        .where(
            DocumentAssignment.document_module == module,
            DocumentAssignment.document_id == document_id,
        )
    ).all()

    if not assignments:
        return None

    statuses = [a.status for a in assignments]

    if module in ("inventorization", "receive"):
        if all(s == AssignmentStatus.waiting_to_start for s in statuses):
            new_status = "waiting_to_start"


        elif all(
                s in (AssignmentStatus.in_progress, AssignmentStatus.scanning_completed, AssignmentStatus.completed) for
                s in statuses):

            if all(s in (AssignmentStatus.scanning_completed, AssignmentStatus.completed) for s in statuses):

                new_status = "scanning_completed"

            else:

                new_status = "in_progress"

        elif all(s == AssignmentStatus.recount_requested for s in statuses):
            new_status = "recount_requested"

        elif all(s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed) for s in statuses):
            # everyone has at least started recount
            if all(s == AssignmentStatus.recount_completed for s in statuses):
                new_status = "recount_completed"
            else:
                new_status = "recount_in_progress"

        else:
            # mixed stage, not everyone has reached the next shared step yet
            if any(s in (AssignmentStatus.recount_requested, AssignmentStatus.recount_in_progress,
                         AssignmentStatus.recount_completed) for s in statuses):
                new_status = "recount_requested"
            else:
                new_status = "waiting_to_start"

        if module == "inventorization":
            obj = get_or_404(db, Inventorization, document_id)
            obj.status = InventorizationStatus(new_status)
        else:
            obj = get_or_404(db, Receive, document_id)
            obj.status = ReceiveStatus(new_status)


    elif module == "transfer":

        sender_assignments = [a for a in assignments if a.role == AssignmentRole.sender]

        receiver_assignments = [a for a in assignments if a.role == AssignmentRole.receiver]

        obj = get_or_404(db, Transfer, document_id)

        sender_statuses = [a.status for a in sender_assignments]

        receiver_statuses = [a.status for a in receiver_assignments]

        # 1. Sender phase first

        if sender_assignments and not all(s == AssignmentStatus.completed for s in sender_statuses):

            if all(s == AssignmentStatus.waiting_to_start for s in sender_statuses):

                obj.status = TransferStatus.waiting_to_start


            elif all(s in (AssignmentStatus.in_progress, AssignmentStatus.completed) for s in sender_statuses):

                if all(s == AssignmentStatus.completed for s in sender_statuses):

                    obj.status = TransferStatus.sender_completed

                else:

                    obj.status = TransferStatus.sender_in_progress


            elif all(s == AssignmentStatus.recount_requested for s in sender_statuses):

                obj.status = TransferStatus.sender_recount_requested


            elif all(s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed) for s in
                     sender_statuses):

                if all(s == AssignmentStatus.recount_completed for s in sender_statuses):

                    obj.status = TransferStatus.sender_recount_completed

                else:

                    obj.status = TransferStatus.sender_recount_in_progress


            else:

                # mixed sender stage, not all reached next shared step yet

                if any(s in (

                        AssignmentStatus.recount_requested,

                        AssignmentStatus.recount_in_progress,

                        AssignmentStatus.recount_completed,

                ) for s in sender_statuses):

                    obj.status = TransferStatus.sender_recount_requested

                else:

                    obj.status = TransferStatus.waiting_to_start


        # 2. Sender phase finished, now evaluate receiver phase

        elif sender_assignments and all(s == AssignmentStatus.completed for s in sender_statuses):

            if not receiver_assignments:

                obj.status = TransferStatus.sender_completed


            elif all(s == AssignmentStatus.waiting_to_start for s in receiver_statuses):

                obj.status = TransferStatus.sender_completed


            elif all(s in (AssignmentStatus.in_progress, AssignmentStatus.completed) for s in receiver_statuses):

                if all(s == AssignmentStatus.completed for s in receiver_statuses):

                    obj.status = TransferStatus.receive_completed

                else:

                    obj.status = TransferStatus.receive_in_progress


            elif all(s == AssignmentStatus.recount_requested for s in receiver_statuses):

                obj.status = TransferStatus.receive_recount_requested


            elif all(s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed) for s in
                     receiver_statuses):

                if all(s == AssignmentStatus.recount_completed for s in receiver_statuses):

                    obj.status = TransferStatus.receive_recount_completed

                else:

                    obj.status = TransferStatus.receive_recount_in_progress


            else:

                # mixed receiver stage, not all reached next shared step yet

                if any(s in (

                        AssignmentStatus.recount_requested,

                        AssignmentStatus.recount_in_progress,

                        AssignmentStatus.recount_completed,

                ) for s in receiver_statuses):

                    obj.status = TransferStatus.receive_recount_requested

                else:

                    obj.status = TransferStatus.sender_completed

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj.status

def _get_user_document_status(
    db: Session,
    module: str,
    document_id: int,
    current_user: PocketUser,
) -> str | None:
    module_enum = DocumentModule(module)

    if module in ("inventorization", "receive"):
        assignment = db.scalar(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == module_enum,
                DocumentAssignment.document_id == document_id,
                DocumentAssignment.pocket_user_id == current_user.id,
                DocumentAssignment.role == AssignmentRole.worker,
            )
        )
        return assignment.status.value if assignment else None

    if module == "transfer":
        sender_assignment = db.scalar(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == module_enum,
                DocumentAssignment.document_id == document_id,
                DocumentAssignment.pocket_user_id == current_user.id,
                DocumentAssignment.role == AssignmentRole.sender,
            )
        )

        receiver_assignment = db.scalar(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == module_enum,
                DocumentAssignment.document_id == document_id,
                DocumentAssignment.pocket_user_id == current_user.id,
                DocumentAssignment.role == AssignmentRole.receiver,
            )
        )

        if sender_assignment and sender_assignment.status != AssignmentStatus.completed:
            return sender_assignment.status.value

        if receiver_assignment:
            return receiver_assignment.status.value

        if sender_assignment:
            return sender_assignment.status.value

    return None

# send all docs data(not lines)
@router.get("/documents", response_model=list[PocketDocument])
def pocket_documents(
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db)
):
    print("got request from pocket")

    result = []

    # INVENTORIZATIONS
    inventorization_docs = db.scalars(
        select(Inventorization)
        .where(Inventorization.warehouse_id.in_(current_user.warehouses))
        .order_by(Inventorization.id.desc())
    ).all()

    for doc in inventorization_docs:
        print('-inven', current_user.id)
        print('-inven',doc.employees)
        print('inv - check: ', doc.id, current_user.id, doc.status)
        if current_user.id in (doc.employees or []):
            user_status = _get_user_document_status(db, "inventorization", doc.id, current_user)

            if not user_status or user_status not in ALLOWED_POCKET_STATUSES_INVENTORIZATION_RECEIVE:
                continue

            result.append({
                "id": doc.id,
                "name": doc.name,
                "warehouse_id": doc.warehouse_id,
                "warehouse_name": doc.warehouse.name if doc.warehouse else None,
                "doc_module": "inventorization",
                "scan_type": doc.scan_type,
                "parent_document_id": doc.parent_document_id,
                "status": user_status,
                "description": doc.description,
                "employees": doc.employees,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            })

    # TRANSFERS
    transfer_docs = db.scalars(
        select(Transfer)
        .where(
            Transfer.from_warehouse_id.in_(current_user.warehouses) |
            Transfer.to_warehouse_id.in_(current_user.warehouses)
        )
        .order_by(Transfer.id.desc())
    ).all()

    for doc in transfer_docs:
        is_sender = current_user.id in (doc.sender_user_ids or [])
        is_receiver = current_user.id in (doc.receiver_user_ids or [])

        if not is_sender and not is_receiver:
            continue

        user_status = _get_user_document_status(db, "transfer", doc.id, current_user)

        if not user_status:
            continue

        allowed = False

        if is_sender and user_status in ALLOWED_POCKET_STATUSES_TRANSFER_SENDER:
            allowed = True

        if is_receiver and user_status in ALLOWED_POCKET_STATUSES_TRANSFER_RECEIVER:
            allowed = True

        if not allowed:
            continue

        from_wh = db.get(Warehouse, doc.from_warehouse_id)
        to_wh = db.get(Warehouse, doc.to_warehouse_id)

        result.append({
            "id": doc.id,
            "name": doc.name,
            "doc_module": "transfer",
            "scan_type": doc.scan_type,
            "status": user_status,

            "from_warehouse_id": doc.from_warehouse_id,
            "from_warehouse_name": from_wh.name if from_wh else None,

            "to_warehouse_id": doc.to_warehouse_id,
            "to_warehouse_name": to_wh.name if to_wh else None,

            "warehouse_id": None,
            "warehouse_name": None,

            "parent_document_id": None,
            "description": doc.description,
            "employees": None,

            "created_at": doc.created_at,
            "updated_at": doc.updated_at
        })

    # RECEIVES
    receive_docs = db.scalars(
        select(Receive)
        .where(Receive.warehouse_id.in_(current_user.warehouses))
        .order_by(Receive.id.desc())
    ).all()
    print("receive stats", Receive.warehouse_id)
    for doc in receive_docs:
        print('-receiv',current_user.id)
        print('-receiv',doc.receiver_user_ids)
        if current_user.id in (doc.receiver_user_ids or []):
            user_status = _get_user_document_status(db, "receive", doc.id, current_user)

            if not user_status or user_status not in ALLOWED_POCKET_STATUSES_INVENTORIZATION_RECEIVE:
                continue

            wh = db.get(Warehouse, doc.warehouse_id)

            result.append({
                "id": doc.id,
                "name": doc.name,
                "warehouse_id": doc.warehouse_id,
                "warehouse_name": wh.name if wh else None,
                "doc_module": "receive",
                "scan_type": doc.scan_type,
                "parent_document_id": doc.parent_document_id,
                "status": user_status,
                "description": doc.description,
                "employees": doc.receiver_user_ids,
                "created_at": doc.created_at,
                "updated_at": doc.updated_at
            })

    return result

@router.post("/document/{document_id}/{module}/status-change")
def document_status_change(
    document_id: int,
    module: str,
    payload: PocketStatusChangeRequest,
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db),
):
    if module == "inventorization":
        doc = get_or_404(db, Inventorization, document_id)
    elif module == "receive":
        doc = get_or_404(db, Receive, document_id)
    elif module == "transfer":
        doc = get_or_404(db, Transfer, document_id)
    else:
        return {"ok": False, "message": f"Unsupported module: {module}"}

    try:
        role = _get_assignment_role_for_user(module, doc, current_user.id, payload.role)
    except ValueError as e:
        return {"ok": False, "message": str(e)}

    assignment = db.scalar(
        select(DocumentAssignment).where(
            DocumentAssignment.document_module == module,
            DocumentAssignment.document_id == document_id,
            DocumentAssignment.pocket_user_id == current_user.id,
            DocumentAssignment.role == role,
        )
    )

    if not assignment:
        return {"ok": False, "message": "Assignment not found for current user"}

    current_assignment_status = assignment.status.value if hasattr(assignment.status, "value") else str(
        assignment.status)

    if payload.current_status != current_assignment_status:
        return {
            "ok": False,
            "message": f"Status mismatch. Client sent '{payload.current_status}', but server has assignment status '{current_assignment_status}'"
        }

    next_status = _get_next_assignment_status_on_load_data(module, current_assignment_status, role.value if hasattr(role, "value") else str(role))

    if not next_status:
        return {
            "ok": False,
            "message": f"Load data is not allowed for current status '{current_assignment_status}'"
        }

    assignment.status = AssignmentStatus(next_status)

    now = datetime.utcnow()
    if assignment.status == AssignmentStatus.in_progress:
        assignment.loaded_at = assignment.loaded_at or now
        assignment.started_at = assignment.started_at or now
    elif assignment.status == AssignmentStatus.recount_in_progress:
        assignment.loaded_at = assignment.loaded_at or now
        assignment.recount_started_at = assignment.recount_started_at or now

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    new_document_status = recalc_document_status(db, module, document_id)

    return {
        "ok": True,
        "document_id": document_id,
        "module": module,
        "assignment_id": assignment.id,
        "previous_document_status": current_assignment_status,
        "assignment_status": assignment.status.value,
        "document_status": new_document_status.value if hasattr(new_document_status, "value") else str(new_document_status),
        "user_id": current_user.id,
        "role": role.value if hasattr(role, "value") else str(role),
    }

@router.get("/{doc_id}/lines", response_model=list[PocketDocumentLine])
def list_lines(doc_id: int, module: str, db: Session = Depends(get_db)):

    if module == "inventorization":
        lines = db.scalars(
            select(InventorizationLine)
            .where(InventorizationLine.document_id == doc_id)
            .order_by(InventorizationLine.id)
        ).all()

    elif module == "transfer":
        from app.models.models import TransferLine

        lines = db.scalars(
            select(TransferLine)
            .where(TransferLine.document_id == doc_id)
            .order_by(TransferLine.id)
        ).all()

    elif module == "receive":
        from app.models.models import ReceiveLine

        lines = db.scalars(
            select(ReceiveLine)
            .where(ReceiveLine.document_id == doc_id)
            .order_by(ReceiveLine.id)
        ).all()

    else:
        return []

    return lines

