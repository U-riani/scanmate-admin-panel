from enum import Enum


class TransferStatus(str, Enum):
    draft = 'draft'
    waiting_to_start = 'waiting_to_start'
    sender_in_progress = 'sender_in_progress'
    sender_completed = 'sender_completed'
    sender_recount_requested = 'sender_recount_requested'
    sender_recount_in_progress = 'sender_recount_in_progress'
    sender_recount_completed = 'sender_recount_completed'
    receive_in_progress = 'receive_in_progress'
    receive_completed = 'receive_completed'
    receive_recount_requested = 'receive_recount_requested'
    receive_recount_in_progress = 'receive_recount_in_progress'
    receive_recount_completed = 'receive_recount_completed'
    closed = 'closed'


class SignatureStatus(str, Enum):
    pending = 'pending'
    confirmed = 'confirmed'


class InventorizationStatus(str, Enum):
    draft = 'draft'
    waiting_to_start = 'waiting_to_start'
    in_progress = 'in_progress'
    scanning_completed = 'scanning_completed'
    recount_requested = 'recount_requested'
    recount_in_progress = 'recount_in_progress'
    recount_completed = 'recount_completed'
    confirmed = 'confirmed'
    closed='closed'

class ReceiveStatus(str, Enum):
    draft = 'draft'
    waiting_to_start = 'waiting_to_start'
    in_progress = 'in_progress'
    scanning_completed = 'scanning_completed'
    recount_requested = 'recount_requested'
    recount_in_progress = 'recount_in_progress'
    recount_completed = 'recount_completed'
    confirmed = 'confirmed'
    closed='closed'



# class DocumentType(str, Enum):
#     barcode = 'barcode'
#     loots = 'loots'
#     manual = 'manual'
#     recount = 'recount'

class DocumentModule(str, Enum):
    inventorization = "inventorization"
    transfer = "transfer"
    receive = "receive"
    sale = "sale"

class ScanType(str, Enum):
    barcode = "barcode"
    loots = "loots"
    manual = "manual"

class PriceUploadStatus(str, Enum):
    active = 'active'
    archived = 'archived'


class PriceType(str, Enum):
    discounted = 'discounted'
    markup = 'markup'
    none = 'none'

class AssignmentRole(str, Enum):
    worker = "worker"              # for inventorization / receive
    sender = "sender"              # transfer sender phase
    receiver = "receiver"          # transfer receiver phase

class AssignmentStatus(str, Enum):
    waiting_to_start = "waiting_to_start"
    in_progress = "in_progress"
    scanning_completed = "scanning_completed"
    recount_requested = "recount_requested"
    recount_in_progress = "recount_in_progress"
    recount_completed = "recount_completed"