#backend/app/models/models.py

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import (
    DocumentModule,
    ScanType,
    InventorizationStatus,
    PriceType,
    PriceUploadStatus,
    SignatureStatus,
    TransferStatus,
    ReceiveStatus,
    AssignmentStatus,
    AssignmentRole
)


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class WebsiteRole(Base):
    __tablename__ = "website_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255))
    modules: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)


class WebsiteUser(Base):
    __tablename__ = "website_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    username: Mapped[str] = mapped_column(String(80), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role_id: Mapped[int] = mapped_column(ForeignKey("website_roles.id"), nullable=False)

    warehouses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )


class PocketRole(Base):
    __tablename__ = "pocket_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255))
    modules: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)


class PocketUser(Base):
    __tablename__ = "pocket_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    username: Mapped[str] = mapped_column(String(80), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role_id: Mapped[int] = mapped_column(ForeignKey("pocket_roles.id"), nullable=False)

    warehouses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )


class Transfer(Base):
    __tablename__ = "transfers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    number: Mapped[str | None] = mapped_column(String(80))

    from_warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)
    to_warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)

    module: Mapped[DocumentModule] = mapped_column(
        Enum(DocumentModule),
        default=DocumentModule.transfer,
        nullable=False,
    )

    scan_type: Mapped[ScanType] = mapped_column(
        Enum(ScanType),
        default=ScanType.barcode,
        nullable=False
    )

    status: Mapped[TransferStatus] = mapped_column(
        Enum(TransferStatus),
        default=TransferStatus.draft,
        nullable=False,
    )

    sender_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    receiver_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    sender_finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    receiver_finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    signature_status: Mapped[SignatureStatus] = mapped_column(
        Enum(SignatureStatus),
        default=SignatureStatus.pending,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(String(255))

    signed_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("website_users.id"))
    signed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_by: Mapped[int | None] = mapped_column(ForeignKey("website_users.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    total_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sent_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    received_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    difference_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class TransferLine(Base):
    __tablename__ = "transfer_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    document_id: Mapped[int] = mapped_column(
        ForeignKey("transfers.id"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[int | None] = mapped_column(Integer)

    barcode: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    article_code: Mapped[str | None] = mapped_column(String(80))
    product_name: Mapped[str | None] = mapped_column(String(255))

    color: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str | None] = mapped_column(String(255))

    price: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    expected_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    base_sent_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_received_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_recounted_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    sent_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    received_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    recounted_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    difference_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    sender_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    receiver_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False
    )

    sender_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    receiver_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    recount_requested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    box_id: Mapped[str | None] = mapped_column(String(80), index=True)


class Inventorization(Base):
    __tablename__ = "inventorizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False
    )

    warehouse: Mapped["Warehouse"] = relationship("Warehouse")

    module: Mapped[DocumentModule] = mapped_column(
        Enum(DocumentModule),
        default=DocumentModule.inventorization,
        nullable=False,
    )

    scan_type: Mapped[ScanType] = mapped_column(
        Enum(ScanType),
        default=ScanType.barcode,
        nullable=False,
    )

    parent_document_id: Mapped[int | None] = mapped_column(
        ForeignKey("inventorizations.id")
    )

    status: Mapped[InventorizationStatus] = mapped_column(
        Enum(InventorizationStatus),
        default=InventorizationStatus.draft,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(String(255))

    employees: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    recount_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

class InventorizationLine(Base):
    __tablename__ = "inventorization_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    document_id: Mapped[int] = mapped_column(
        ForeignKey("inventorizations.id"),
        nullable=False,
        index=True,
    )

    barcode: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    article_code: Mapped[str | None] = mapped_column(String(80))
    product_name: Mapped[str | None] = mapped_column(String(255))

    color: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str | None] = mapped_column(String(255))

    price: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    expected_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    base_counted_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_recount_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    counted_qty: Mapped[int | None] = mapped_column(Integer)
    recount_qty: Mapped[int | None] = mapped_column(Integer)
    recount_requested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    employee_id: Mapped[int | None] = mapped_column(ForeignKey("pocket_users.id"))

    box_id: Mapped[str | None] = mapped_column(String(80), index=True)


class WarehouseProduct(Base):
    __tablename__ = "warehouse_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    barcode: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    article_code: Mapped[str | None] = mapped_column(String(80))
    product_name: Mapped[str | None] = mapped_column(String(255))

    color: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str | None] = mapped_column(String(255))

    price: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    stock_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class PriceUpload(Base):
    __tablename__ = "price_uploads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    file_name: Mapped[str | None] = mapped_column(String(255))

    uploaded_by: Mapped[int | None] = mapped_column(ForeignKey("website_users.id"))

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    rows_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    valid_rows_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_rows_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    duplicate_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    status: Mapped[PriceUploadStatus] = mapped_column(
        Enum(PriceUploadStatus),
        default=PriceUploadStatus.active,
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(Text)


class PriceRow(Base):
    __tablename__ = "price_rows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    upload_id: Mapped[int] = mapped_column(
        ForeignKey("price_uploads.id"),
        nullable=False,
        index=True,
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    barcode: Mapped[str] = mapped_column(String(80), nullable=False, index=True)

    name: Mapped[str | None] = mapped_column(String(255))

    category: Mapped[str | None] = mapped_column(String(120))
    color: Mapped[str | None] = mapped_column(String(120))
    size: Mapped[str | None] = mapped_column(String(120))

    group_name: Mapped[str | None] = mapped_column(String(120))

    article: Mapped[str | None] = mapped_column(String(120))

    base_price: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    adjusted_price: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    price_type: Mapped[PriceType] = mapped_column(
        Enum(PriceType),
        default=PriceType.none,
        nullable=False,
    )


class Receive(Base):
    __tablename__ = "receives"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    number: Mapped[str | None] = mapped_column(String(80))

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False,
        index=True,
    )

    module: Mapped[DocumentModule] = mapped_column(
        Enum(DocumentModule),
        default=DocumentModule.receive,
        nullable=False,
    )

    scan_type: Mapped[ScanType] = mapped_column(
        Enum(ScanType),
        default=ScanType.barcode,
        nullable=False
    )

    parent_document_id: Mapped[int | None] = mapped_column(
        ForeignKey("receives.id")
    )

    status: Mapped[ReceiveStatus] = mapped_column(
        Enum(ReceiveStatus),
        default=ReceiveStatus.draft,
        nullable=False,
    )

    receiver_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    recount_user_ids: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )
    received_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("website_users.id")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    description: Mapped[str | None] = mapped_column(String(255))

    employees: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    total_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    received_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    difference_lines: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    is_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

class ReceiveLine(Base):
    __tablename__ = "receive_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    document_id: Mapped[int] = mapped_column(
        ForeignKey("receives.id"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[int | None] = mapped_column(Integer)

    barcode: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    article_code: Mapped[str | None] = mapped_column(String(80))
    product_name: Mapped[str | None] = mapped_column(String(255))

    color: Mapped[str | None] = mapped_column(String(255))
    size: Mapped[str | None] = mapped_column(String(255))

    price: Mapped[float] = mapped_column(Float, default=0, nullable=False)

    expected_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    base_counted_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_recount_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    counted_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    recount_qty: Mapped[int | None] = mapped_column(Integer)

    recount_requested: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    difference_qty: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    receiver_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("pocket_users.id")
    )

    received_scanned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    box_id: Mapped[str | None] = mapped_column(String(80), index=True)


class DocumentAssignment(Base):
    __tablename__ = "document_assignments"
    __table_args__ = (
        UniqueConstraint(
            "document_module",
            "document_id",
            "pocket_user_id",
            "role",
            name="uq_document_assignment_unique_user_role",
        ),
        Index("ix_document_assignments_lookup", "document_module", "document_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    document_module: Mapped[DocumentModule] = mapped_column(
        Enum(DocumentModule),
        nullable=False,
        index=True,
    )

    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    pocket_user_id: Mapped[int] = mapped_column(
        ForeignKey("pocket_users.id"),
        nullable=False,
        index=True,
    )

    role: Mapped[AssignmentRole] = mapped_column(
        Enum(AssignmentRole),
        default=AssignmentRole.worker,
        nullable=False,
    )

    status: Mapped[AssignmentStatus] = mapped_column(
        Enum(AssignmentStatus),
        default=AssignmentStatus.waiting_to_start,
        nullable=False,
    )

    loaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    recount_requested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    recount_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    recount_completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

class DocumentLineUserResult(Base):
    __tablename__ = "document_line_user_results"
    __table_args__ = (
        UniqueConstraint(
            "document_module",
            "document_id",
            "line_id",
            "pocket_user_id",
            "role",
            name="uq_doc_line_user_result",
        ),
        Index("ix_doc_line_user_results_lookup", "document_module", "document_id", "line_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    document_module: Mapped[DocumentModule] = mapped_column(
        Enum(DocumentModule),
        nullable=False,
        index=True,
    )

    document_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    line_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)

    pocket_user_id: Mapped[int] = mapped_column(
        ForeignKey("pocket_users.id"),
        nullable=False,
        index=True,
    )

    role: Mapped[AssignmentRole] = mapped_column(
        Enum(AssignmentRole),
        default=AssignmentRole.worker,
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    recount_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )