from enum import Enum


class TransferStatus(str, Enum):
    draft = 'draft'
    in_progress = 'in_progress'
    sent = 'sent'
    received = 'received'
    closed = 'closed'


class SignatureStatus(str, Enum):
    pending = 'pending'
    confirmed = 'confirmed'


class InventorizationStatus(str, Enum):
    draft = 'draft'
    in_progress = 'in_progress'
    completed = 'completed'
    recounted = 'recounted'

class ReceiveStatus(str, Enum):
    draft = 'draft'
    in_progress = 'in_progress'
    completed = 'completed'
    recount_requested = 'recount_requested'
    recount_in_progress = 'recount_in_progress'
    recount_completed = 'recount_completed'
    confirmed = 'confirmed'



class DocumentType(str, Enum):
    barcode = 'barcode'
    manual = 'manual'
    recount = 'recount'


class PriceUploadStatus(str, Enum):
    active = 'active'
    archived = 'archived'


class PriceType(str, Enum):
    discounted = 'discounted'
    markup = 'markup'
    none = 'none'
