#backend/app/api/routes/pocket_api.py

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentModule, InventorizationStatus, ReceiveStatus, TransferStatus, AssignmentStatus, AssignmentRole
from app.models.models import (
    Inventorization,
    InventorizationLine,
    WarehouseProduct,
    Warehouse,
    PocketUser,
    Transfer,
    TransferLine,
    Receive,
    ReceiveLine,
    DocumentAssignment,
    DocumentLineUserResult
)
from app.schemas.pocketApiSchema import (
    PocketDocument,
    PocketDocumentLine,
    PocketStatusChangeRequest,
    PocketSubmitLinesRequest,
    PocketSubmitLinesResponse,
    PocketFinishScanningRequest
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
    "in_progress",
    "recount_requested",
    "recount_in_progress",
]

ALLOWED_POCKET_STATUSES_TRANSFER_RECEIVER = [
    "waiting_receiver_to_start",
    "receive_in_progress",
    "receive_recount_requested",
    "receive_recount_in_progress",
]

def _get_current_assignment(
    db: Session,
    module: str,
    document_id: int,
    current_user_id: int,
    role: AssignmentRole,
) -> DocumentAssignment | None:
    return db.scalar(
        select(DocumentAssignment).where(
            DocumentAssignment.document_module == module,
            DocumentAssignment.document_id == document_id,
            DocumentAssignment.pocket_user_id == current_user_id,
            DocumentAssignment.role == role,
        )
    )

def _find_line_by_row(lines, row):
    if row.line_id is not None:
        for line in lines:
            if line.id == row.line_id:
                return line

    # fallback
    if row.box_id:
        for line in lines:
            if line.barcode == row.barcode and (line.box_id or "") == row.box_id:
                return line

    for line in lines:
        if line.barcode == row.barcode:
            return line

    return None

def _recalc_worker_line_totals(db: Session, module: str, document_id: int):
    if module == "inventorization":
        lines = db.scalars(
            select(InventorizationLine).where(InventorizationLine.document_id == document_id)
        ).all()
    else:
        lines = db.scalars(
            select(ReceiveLine).where(ReceiveLine.document_id == document_id)
        ).all()

    for line in lines:
        results = db.scalars(
            select(DocumentLineUserResult).where(
                DocumentLineUserResult.document_module == DocumentModule(module),
                DocumentLineUserResult.document_id == document_id,
                DocumentLineUserResult.line_id == line.id,
                DocumentLineUserResult.role == AssignmentRole.worker,
            )
        ).all()

        line.counted_qty = (line.base_counted_qty or 0) + sum(r.quantity for r in results)
        line.recount_qty = (line.base_recount_qty or 0) + sum(r.recount_quantity for r in results)

        db.add(line)


def _recalc_transfer_line_totals(db: Session, document_id: int):
    lines = db.scalars(
        select(TransferLine).where(TransferLine.document_id == document_id)
    ).all()

    for line in lines:
        results = db.scalars(
            select(DocumentLineUserResult).where(
                DocumentLineUserResult.document_module == DocumentModule.transfer,
                DocumentLineUserResult.document_id == document_id,
                DocumentLineUserResult.line_id == line.id,
            )
        ).all()

        line.sent_qty = (line.base_sent_qty or 0) + sum(
            r.quantity for r in results if r.role == AssignmentRole.sender
        )
        line.received_qty = (line.base_received_qty or 0) + sum(
            r.quantity for r in results if r.role == AssignmentRole.receiver
        )

        line.sender_recounted_qty = (line.base_sender_recount_qty or 0) + sum(
            r.recount_quantity for r in results if r.role == AssignmentRole.sender
        )
        line.receiver_recounted_qty = (line.base_receiver_recount_qty or 0) + sum(
            r.recount_quantity for r in results if r.role == AssignmentRole.receiver
        )

        db.add(line)


def _get_next_assignment_status_on_finish_scanning(
    module: str,
    assignment_status: str,
    role: str | None = None,
) -> str | None:
    if module in ("inventorization", "receive"):
        if assignment_status == "in_progress":
            return "scanning_completed"
        if assignment_status == "recount_in_progress":
            return "recount_completed"
        return None

    if module == "transfer":
        if role in ("sender", "receiver"):
            if assignment_status == "in_progress":
                return "completed"
            if assignment_status == "recount_in_progress":
                return "recount_completed"
        return None

    return None

def _get_next_assignment_status_on_load_data(
    module: str,
    assignment_status: str,
    role: str | None = None,
) -> str | None:
    if module in ("inventorization", "receive"):
        if assignment_status == "waiting_to_start":
            return "in_progress"
        if assignment_status == "recount_requested":
            return "recount_in_progress"
        return None

    if module == "transfer":
        if role == "sender":
            if assignment_status == "waiting_to_start":
                return "in_progress"
            if assignment_status == "recount_requested":
                return "recount_in_progress"
            return None

        if role == "receiver":
            if assignment_status == "waiting_to_start":
                return "in_progress"
            if assignment_status == "recount_requested":
                return "recount_in_progress"
            return None

    return None


def _get_assignment_role_for_user(
    module: str,
    doc,
    current_user_id: int,
    requested_role: str | None,
    db: Session | None = None,
) -> AssignmentRole:
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
            if db is not None:
                sender_assignment = db.scalar(
                    select(DocumentAssignment).where(
                        DocumentAssignment.document_module == DocumentModule.transfer,
                        DocumentAssignment.document_id == doc.id,
                        DocumentAssignment.pocket_user_id == current_user_id,
                        DocumentAssignment.role == AssignmentRole.sender,
                    )
                )

                receiver_assignment = db.scalar(
                    select(DocumentAssignment).where(
                        DocumentAssignment.document_module == DocumentModule.transfer,
                        DocumentAssignment.document_id == doc.id,
                        DocumentAssignment.pocket_user_id == current_user_id,
                        DocumentAssignment.role == AssignmentRole.receiver,
                    )
                )

                sender_status = (
                    sender_assignment.status.value
                    if sender_assignment and hasattr(sender_assignment.status, "value")
                    else (str(sender_assignment.status) if sender_assignment else None)
                )
                receiver_status = (
                    receiver_assignment.status.value
                    if receiver_assignment and hasattr(receiver_assignment.status, "value")
                    else (str(receiver_assignment.status) if receiver_assignment else None)
                )

                if sender_status in ("waiting_to_start", "in_progress", "recount_requested", "recount_in_progress"):
                    return AssignmentRole.sender

                if receiver_status in ("waiting_to_start", "in_progress", "recount_requested", "recount_in_progress"):
                    if sender_status in ("completed", "recount_completed"):
                        return AssignmentRole.receiver

            inferred_role = _infer_transfer_role_from_status(doc)
            if inferred_role and inferred_role in allowed_roles:
                return inferred_role

            raise ValueError("Role is required for users assigned as both sender and receiver")

        try:
            role = AssignmentRole(requested_role)
        except Exception:
            raise ValueError("Invalid role")

        if role not in allowed_roles:
            raise ValueError("Requested role is not allowed for this user")

        return role

    raise ValueError("Unsupported module")

def _upsert_user_line_result(
    db: Session,
    module: str,
    document_id: int,
    line_id: int,
    pocket_user_id: int,
    role: AssignmentRole,
    quantity: int,
    is_recount: bool,
):
    result = db.scalar(
        select(DocumentLineUserResult).where(
            DocumentLineUserResult.document_module == DocumentModule(module),
            DocumentLineUserResult.document_id == document_id,
            DocumentLineUserResult.line_id == line_id,
            DocumentLineUserResult.pocket_user_id == pocket_user_id,
            DocumentLineUserResult.role == role,
        )
    )

    if not result:
        result = DocumentLineUserResult(
            document_module=DocumentModule(module),
            document_id=document_id,
            line_id=line_id,
            pocket_user_id=pocket_user_id,
            role=role,
        )

    if is_recount:
        result.recount_quantity = quantity
    else:
        result.quantity = quantity

    db.add(result)

def _get_base_quantity_for_line(module: str, line, role: AssignmentRole, is_recount: bool) -> int:
    if module in ("inventorization", "receive"):
        return (line.base_recount_qty or 0) if is_recount else (line.base_counted_qty or 0)

    if module == "transfer":
        if is_recount:
            if role == AssignmentRole.sender:
                return line.base_sender_recount_qty or 0
            if role == AssignmentRole.receiver:
                return line.base_receiver_recount_qty or 0

        if role == AssignmentRole.sender:
            return line.base_sent_qty or 0

        if role == AssignmentRole.receiver:
            return line.base_received_qty or 0

    return 0


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

        elif any(
                s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed)
                for s in statuses
        ):
            if all(s == AssignmentStatus.recount_completed for s in statuses):
                new_status = "recount_completed"
            else:
                new_status = "recount_in_progress"

        elif any(s == AssignmentStatus.recount_requested for s in statuses):
            new_status = "recount_requested"

        elif any(
                s in (AssignmentStatus.in_progress, AssignmentStatus.scanning_completed, AssignmentStatus.completed)
                for s in statuses
        ):
            if all(s in (AssignmentStatus.scanning_completed, AssignmentStatus.completed) for s in statuses):
                new_status = "scanning_completed"
            else:
                new_status = "in_progress"

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

        receiver_phase_statuses = {
            TransferStatus.waiting_receiver_to_start,
            TransferStatus.receive_in_progress,
            TransferStatus.receive_completed,
            TransferStatus.receive_recount_requested,
            TransferStatus.receive_recount_in_progress,
            TransferStatus.receive_recount_completed,
        }

        # Receiver phase: once admin moved document here, only receiver assignments drive status
        if obj.status in receiver_phase_statuses:

            if not receiver_assignments:
                obj.status = TransferStatus.waiting_receiver_to_start

            elif all(s == AssignmentStatus.waiting_to_start for s in receiver_statuses):
                obj.status = TransferStatus.waiting_receiver_to_start

            elif any(
                s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed)
                for s in receiver_statuses
            ):
                if all(s == AssignmentStatus.recount_completed for s in receiver_statuses):
                    obj.status = TransferStatus.receive_recount_completed
                else:
                    obj.status = TransferStatus.receive_recount_in_progress

            elif any(s == AssignmentStatus.recount_requested for s in receiver_statuses):
                obj.status = TransferStatus.receive_recount_requested

            elif any(
                s in (AssignmentStatus.in_progress, AssignmentStatus.completed)
                for s in receiver_statuses
            ):
                if all(s == AssignmentStatus.completed for s in receiver_statuses):
                    obj.status = TransferStatus.receive_completed
                else:
                    obj.status = TransferStatus.receive_in_progress

            else:
                obj.status = TransferStatus.waiting_receiver_to_start

        # Sender phase: sender assignments drive status until admin moves document forward
        else:

            if not sender_assignments:
                obj.status = TransferStatus.waiting_to_start

            elif all(s == AssignmentStatus.waiting_to_start for s in sender_statuses):
                obj.status = TransferStatus.waiting_to_start

            elif any(
                s in (AssignmentStatus.recount_in_progress, AssignmentStatus.recount_completed)
                for s in sender_statuses
            ):
                if all(s == AssignmentStatus.recount_completed for s in sender_statuses):
                    obj.status = TransferStatus.sender_recount_completed
                else:
                    obj.status = TransferStatus.sender_recount_in_progress

            elif any(s == AssignmentStatus.recount_requested for s in sender_statuses):
                obj.status = TransferStatus.sender_recount_requested

            elif any(
                s in (AssignmentStatus.in_progress, AssignmentStatus.completed)
                for s in sender_statuses
            ):
                if all(s == AssignmentStatus.completed for s in sender_statuses):
                    obj.status = TransferStatus.sender_completed
                else:
                    obj.status = TransferStatus.sender_in_progress

            else:
                obj.status = TransferStatus.waiting_to_start

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
        doc = get_or_404(db, Transfer, document_id)

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

        doc_status = doc.status.value if hasattr(doc.status, "value") else str(doc.status)

        receiver_phase_statuses = {
            "waiting_receiver_to_start",
            "receive_in_progress",
            "receive_completed",
            "receive_recount_requested",
            "receive_recount_in_progress",
            "receive_recount_completed",
        }

        # If main transfer is NOT in receiver phase yet, never expose receiver side
        if doc_status not in receiver_phase_statuses:
            if sender_assignment:
                return sender_assignment.status.value
            return None

        # Main transfer already reached receiver phase, now receiver side may be shown
        if receiver_assignment:
            receiver_status = receiver_assignment.status.value

            if receiver_status == AssignmentStatus.waiting_to_start.value:
                return "waiting_receiver_to_start"

            if receiver_status == AssignmentStatus.in_progress.value:
                return "receive_in_progress"

            if receiver_status == AssignmentStatus.recount_requested.value:
                return "receive_recount_requested"

            if receiver_status == AssignmentStatus.recount_in_progress.value:
                return "receive_recount_in_progress"

            if receiver_status == AssignmentStatus.completed.value:
                return "receive_completed"

            if receiver_status == AssignmentStatus.recount_completed.value:
                return "receive_recount_completed"

            return receiver_status

        if sender_assignment:
            return sender_assignment.status.value

        return None

    return None

def _normalize_client_status_for_assignment(module: str, current_status: str) -> str:
    if module == "transfer":
        mapping = {
            "waiting_receiver_to_start": "waiting_to_start",
            "receive_in_progress": "in_progress",
            "receive_recount_requested": "recount_requested",
            "receive_recount_in_progress": "recount_in_progress",
            "receive_completed": "completed",
            "receive_recount_completed": "recount_completed",
        }
        return mapping.get(current_status, current_status)

    return current_status

def _infer_transfer_role_from_status(doc) -> AssignmentRole | None:
    status = doc.status.value if hasattr(doc.status, "value") else str(doc.status)

    sender_statuses = {
        "waiting_to_start",
        "sender_in_progress",
        "sender_recount_requested",
        "sender_recount_in_progress",
        "sender_recount_completed",
    }

    receiver_statuses = {
        "waiting_receiver_to_start",
        "receive_in_progress",
        "receive_completed",
        "receive_recount_requested",
        "receive_recount_in_progress",
        "receive_recount_completed",
    }

    if status in sender_statuses:
        return AssignmentRole.sender

    if status in receiver_statuses:
        return AssignmentRole.receiver

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

            print('inv -- sent1')
            print('inv -- user_status', user_status)
            if not user_status or user_status not in ALLOWED_POCKET_STATUSES_INVENTORIZATION_RECEIVE:
                continue
            print('inv -- sent2')
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
        role = _get_assignment_role_for_user(module, doc, current_user.id, payload.role, db=db)
        print("TRANSFER ROLE RESOLVED:", role)
        print("PAYLOAD CURRENT STATUS:", payload.current_status)
        print("DOC STATUS:", doc.status)
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
    print("ASSIGNMENT FOUND:", assignment.id if assignment else None)
    print("ASSIGNMENT STATUS:", assignment.status if assignment else None)
    if not assignment:
        return {"ok": False, "message": "Assignment not found for current user"}

    current_assignment_status = (
        assignment.status.value if hasattr(assignment.status, "value") else str(assignment.status)
    )

    normalized_client_status = _normalize_client_status_for_assignment(
        module, payload.current_status
    )

    if normalized_client_status != current_assignment_status:
        return {
            "ok": False,
            "message": f"Status mismatch. Client sent '{payload.current_status}', normalized to '{normalized_client_status}', but server has assignment status '{current_assignment_status}'"
        }

    next_status = _get_next_assignment_status_on_load_data(
        module,
        current_assignment_status,
        role.value if hasattr(role, "value") else str(role),
    )

    if not next_status:
        return {
            "ok": False,
            "message": f"Load data is not allowed for current assignment status '{current_assignment_status}'"
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
        "previous_assignment_status": current_assignment_status,
        "assignment_status": assignment.status.value,
        "document_status": new_document_status.value if hasattr(new_document_status, "value") else str(new_document_status),
        "user_id": current_user.id,
        "role": role.value if hasattr(role, "value") else str(role),
    }

@router.get("/{doc_id}/lines", response_model=list[PocketDocumentLine])
def list_lines(
    doc_id: int,
    module: str,
    role: str | None = None,
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db),
):
    if module == "inventorization":
        assignment = db.scalar(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.inventorization,
                DocumentAssignment.document_id == doc_id,
                DocumentAssignment.pocket_user_id == current_user.id,
                DocumentAssignment.role == AssignmentRole.worker,
            )
        )

        query = select(InventorizationLine).where(
            InventorizationLine.document_id == doc_id
        )

        if assignment and assignment.status in (
                AssignmentStatus.recount_requested,
                AssignmentStatus.recount_in_progress,
                AssignmentStatus.recount_completed,
        ):
            query = query.where(InventorizationLine.recount_requested == True)

        lines = db.scalars(
            query.order_by(InventorizationLine.id)
        ).all()

        return [
            PocketDocumentLine(
                id=line.id,
                document_id=line.document_id,
                barcode=line.barcode,
                article_code=line.article_code,
                product_name=line.product_name,
                color=line.color,
                size=line.size,
                price=line.price,
                box_id=line.box_id,
                expected_qty=line.expected_qty,
                counted_qty=line.base_recount_qty if line.recount_requested else line.base_counted_qty,
                employee_id=current_user.id,
            )
            for line in lines
        ]

    elif module == "receive":
        assignment = db.scalar(
            select(DocumentAssignment).where(
                DocumentAssignment.document_module == DocumentModule.receive,
                DocumentAssignment.document_id == doc_id,
                DocumentAssignment.pocket_user_id == current_user.id,
                DocumentAssignment.role == AssignmentRole.worker,
            )
        )

        query = select(ReceiveLine).where(
            ReceiveLine.document_id == doc_id
        )

        if assignment and assignment.status in (
                AssignmentStatus.recount_requested,
                AssignmentStatus.recount_in_progress,
                AssignmentStatus.recount_completed,
        ):
            query = query.where(ReceiveLine.recount_requested == True)

        lines = db.scalars(
            query.order_by(ReceiveLine.id)
        ).all()

        return [
            PocketDocumentLine(
                id=line.id,
                document_id=line.document_id,
                barcode=line.barcode,
                article_code=line.article_code,
                product_name=line.product_name,
                color=line.color,
                size=line.size,
                price=line.price,
                box_id=line.box_id,
                expected_qty=line.expected_qty,
                counted_qty=line.base_recount_qty if line.recount_requested else line.base_counted_qty,
                employee_id=current_user.id,
            )
            for line in lines
        ]


    elif module == "transfer":

        doc = get_or_404(db, Transfer, doc_id)

        resolved_role = _get_assignment_role_for_user(module, doc, current_user.id, role, db=db)

        assignment = db.scalar(

            select(DocumentAssignment).where(

                DocumentAssignment.document_module == DocumentModule.transfer,

                DocumentAssignment.document_id == doc_id,

                DocumentAssignment.pocket_user_id == current_user.id,

                DocumentAssignment.role == resolved_role,

            )

        )

        query = select(TransferLine).where(

            TransferLine.document_id == doc_id

        )

        if assignment and assignment.status in (
                AssignmentStatus.recount_requested,
                AssignmentStatus.recount_in_progress,
                AssignmentStatus.recount_completed,
        ):
            if resolved_role == AssignmentRole.sender:
                query = query.where(TransferLine.sender_recount_requested == True)
            else:
                query = query.where(TransferLine.receiver_recount_requested == True)

        lines = db.scalars(

            query.order_by(TransferLine.id)

        ).all()

        def get_transfer_expected_qty_for_pocket(line, resolved_role):
            if resolved_role == AssignmentRole.receiver:
                if line.sender_recounted_qty is not None and line.sender_recounted_qty > 0:
                    return line.sender_recounted_qty

                return line.sent_qty or 0

            return line.expected_qty or 0

        return [

            PocketDocumentLine(

                id=line.id,

                document_id=line.document_id,

                barcode=line.barcode,

                article_code=line.article_code,

                product_name=line.product_name,

                color=line.color,

                size=line.size,

                price=line.price,

                box_id=line.box_id,

                expected_qty=get_transfer_expected_qty_for_pocket(line, resolved_role),

                counted_qty=(
                    line.sender_recounted_qty
                    if resolved_role == AssignmentRole.sender and line.sender_recount_requested
                    else (
                        line.receiver_recounted_qty
                        if resolved_role == AssignmentRole.receiver and line.receiver_recount_requested
                        else (
                            line.sent_qty
                            if resolved_role == AssignmentRole.sender
                            else line.received_qty
                        )
                    )
                ),

                employee_id=current_user.id,

            )

            for line in lines

        ]

    return []

@router.post(
    "/document/{document_id}/{module}/submit-lines",
    response_model=PocketSubmitLinesResponse,
)
def submit_lines(
    document_id: int,
    module: str,
    payload: PocketSubmitLinesRequest,
    current_user: PocketUser = Depends(get_current_pocket_user),
    db: Session = Depends(get_db),
):
    print("payload", payload)
    # 1. Load document
    if module == "inventorization":
        doc = get_or_404(db, Inventorization, document_id)
        lines = db.scalars(
            select(InventorizationLine).where(InventorizationLine.document_id == document_id)
        ).all()
    elif module == "receive":
        doc = get_or_404(db, Receive, document_id)
        lines = db.scalars(
            select(ReceiveLine).where(ReceiveLine.document_id == document_id)
        ).all()
    elif module == "transfer":
        doc = get_or_404(db, Transfer, document_id)
        lines = db.scalars(
            select(TransferLine).where(TransferLine.document_id == document_id)
        ).all()
    else:
        return {
            "ok": False,
            "document_id": document_id,
            "module": module,
            "processed_rows": 0,
            "updated_lines": 0,
            "assignment_status": "",
        }

    # 2. Resolve role / assignment
    try:
        role = _get_assignment_role_for_user(module, doc, current_user.id, payload.role, db=db)
    except ValueError as e:
        return {
            "ok": False,
            "document_id": document_id,
            "module": module,
            "processed_rows": 0,
            "updated_lines": 0,
            "assignment_status": str(e),
        }

    assignment = _get_current_assignment(db, module, document_id, current_user.id, role)
    if not assignment:
        return {
            "ok": False,
            "document_id": document_id,
            "module": module,
            "role": role.value,
            "processed_rows": 0,
            "updated_lines": 0,
            "assignment_status": "assignment_not_found",
        }

    current_assignment_status = assignment.status.value

    normalized_client_status = _normalize_client_status_for_assignment(
        module, payload.current_status
    )

    if normalized_client_status != current_assignment_status:
        return {
            "ok": False,
            "document_id": document_id,
            "module": module,
            "role": role.value,
            "processed_rows": 0,
            "updated_lines": 0,
            "assignment_status": current_assignment_status,
        }

    # 3. Decide normal scan vs recount
    is_recount = current_assignment_status == "recount_in_progress"

    processed_rows = 0
    updated_lines = 0

    for row in payload.rows:
        processed_rows += 1

        line = _find_line_by_row(lines, row)
        if not line:
            continue

        base_qty = _get_base_quantity_for_line(module, line, role, is_recount)
        user_contribution = max((row.quantity or 0) - base_qty, 0)

        _upsert_user_line_result(
            db=db,
            module=module,
            document_id=document_id,
            line_id=line.id,
            pocket_user_id=current_user.id,
            role=role,
            quantity=user_contribution,
            is_recount=is_recount,
        )

        updated_lines += 1

    db.flush()

    if module in ("inventorization", "receive"):
        _recalc_worker_line_totals(db, module, document_id)
    elif module == "transfer":
        _recalc_transfer_line_totals(db, document_id)

    db.commit()

    return {
        "ok": True,
        "document_id": document_id,
        "module": module,
        "role": role.value,
        "processed_rows": processed_rows,
        "updated_lines": updated_lines,
        "assignment_status": current_assignment_status,
    }

@router.post("/document/{document_id}/{module}/finish-scanning")
def finish_scanning(
    document_id: int,
    module: str,
    payload: PocketFinishScanningRequest,
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
        role = _get_assignment_role_for_user(module, doc, current_user.id, payload.role, db=db)
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

    current_assignment_status = (
        assignment.status.value if hasattr(assignment.status, "value") else str(assignment.status)
    )

    normalized_client_status = _normalize_client_status_for_assignment(
        module, payload.current_status
    )

    if normalized_client_status != current_assignment_status:
        return {
            "ok": False,
            "message": f"Status mismatch. Client sent '{payload.current_status}', normalized to '{normalized_client_status}', but server has assignment status '{current_assignment_status}'"
        }

    next_status = _get_next_assignment_status_on_finish_scanning(
        module,
        current_assignment_status,
        role.value if hasattr(role, "value") else str(role),
    )

    if not next_status:
        return {
            "ok": False,
            "message": f"Finish scanning is not allowed for current assignment status '{current_assignment_status}'"
        }

    assignment.status = AssignmentStatus(next_status)

    now = datetime.utcnow()

    if assignment.status == AssignmentStatus.scanning_completed:
        assignment.completed_at = assignment.completed_at or now
    elif assignment.status == AssignmentStatus.completed:
        assignment.completed_at = assignment.completed_at or now
    elif assignment.status == AssignmentStatus.recount_completed:
        assignment.recount_completed_at = assignment.recount_completed_at or now

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    new_document_status = recalc_document_status(db, module, document_id)

    return {
        "ok": True,
        "document_id": document_id,
        "module": module,
        "assignment_id": assignment.id,
        "previous_assignment_status": current_assignment_status,
        "assignment_status": assignment.status.value,
        "document_status": new_document_status.value if hasattr(new_document_status, "value") else str(new_document_status),
        "user_id": current_user.id,
        "role": role.value if hasattr(role, "value") else str(role),
    }