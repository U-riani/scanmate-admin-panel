#backend/app/db/seed.py

from datetime import datetime, timezone
from sqlalchemy import select, text

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.models import (
    Inventorization,
    InventorizationLine,
    Receive,
    ReceiveLine,
    PocketRole,
    PocketUser,
    PriceRow,
    PriceUpload,
    Transfer,
    TransferLine,
    Warehouse,
    WarehouseProduct,
    WebsiteRole,
    WebsiteUser,
    DocumentAssignment

)
from app.models.enums import (
    DocumentModule,
    ScanType,
    InventorizationStatus,
    ReceiveStatus,
    PriceType,
    PriceUploadStatus,
    SignatureStatus,
    TransferStatus,
    AssignmentStatus,
    AssignmentRole
)

_SEEDED_TABLES = [
    "warehouses",
    "website_roles",
    "pocket_roles",
    "website_users",
    "pocket_users",
    "warehouse_products",
    "transfers",
    "transfer_lines",
    "inventorizations",
    "inventorization_lines",
    "receives",
    "receive_lines",
    "price_uploads",
    "price_rows",
    "document_assignments",
    "document_line_user_results",
]


def _reset_sequences(db):
    for table in _SEEDED_TABLES:
        db.execute(
            text(
                f"""
                SELECT setval(
                    pg_get_serial_sequence('{table}', 'id'),
                    COALESCE((SELECT MAX(id) FROM {table}), 1),
                    (SELECT COUNT(*) > 0 FROM {table})
                )
                """
            )
        )
    db.commit()


def seed_database():
    db = SessionLocal()

    try:
        # do not reseed
        if db.scalar(select(WebsiteUser.id).limit(1)):
            return

        # Warehouses
        warehouses = [
            Warehouse(id=1, name="Tbilisi Central", code="TBL", active=True),
            Warehouse(id=2, name="Batumi Store", code="BAT", active=True),
            Warehouse(id=3, name="Kutaisi Store", code="KUT", active=True),
        ]
        db.add_all(warehouses)
        db.commit()

        # Website roles
        website_roles = [
            WebsiteRole(
                id=1,
                name="super_admin",
                description="Full system access",
                modules={
                    "dashboard": True,
                    "users": True,
                    "transfer": True,
                    "sales": True,
                    "website_users": True,
                    "website_roles": True,
                    "pocket_users": True,
                    "pocket_roles": True,
                    "warehouses": True,
                    "settings": True,
                    "reports": True,
                    "inventorization": True,
                    "report": True,
                    "receive": True,
                },
            ),
            WebsiteRole(
                id=2,
                name="admin",
                description="Operational admin",
                modules={
                    "dashboard": True,
                    "transfer": True,
                    "sales": True,
                    "users": True,
                    "website_users": False,
                    "website_roles": False,
                    "pocket_users": True,
                    "pocket_roles": True,
                    "warehouses": True,
                    "settings": False,
                    "reports": True,
                    "inventorization": False,
                },
            ),
        ]
        db.add_all(website_roles)
        db.commit()

        # Pocket roles
        pocket_roles = [
            PocketRole(
                id=1,
                name="warehouse_operator",
                description="Standard warehouse operator",
                modules={
                    "inventorization": True,
                    "transfer": True,
                    "receive": False,
                    "sales": False,
                },
            ),
            PocketRole(
                id=2,
                name="warehouse_supervisor",
                description="Supervisor with wider permissions",
                modules={
                    "inventorization": True,
                    "transfer": True,
                    "receive": True,
                    "sales": False,
                },
            ),
            PocketRole(
                id=3,
                name="warehouse_manager",
                description="Full access",
                modules={
                    "inventorization": True,
                    "transfer": True,
                    "receive": True,
                    "sales": True,
                },
            ),
        ]
        db.add_all(pocket_roles)
        db.commit()

        # Website users
        website_users = [
            WebsiteUser(
                id=1,
                username="super",
                email="super@scanmate.ge",
                password_hash=hash_password("123456"),
                role_id=1,
                warehouses=[1, 2],
                active=True,
                last_login=datetime(2026, 3, 11, tzinfo=timezone.utc),
            ),
            WebsiteUser(
                id=2,
                username="admin",
                email="admin@scanmate.ge",
                password_hash=hash_password("123456"),
                role_id=2,
                warehouses=[1],
                active=True,
                last_login=datetime(2026, 3, 10, tzinfo=timezone.utc),
            ),
        ]
        db.add_all(website_users)
        db.commit()

        # Pocket users
        pocket_users = [
            PocketUser(
                id=1,
                username="giorgi",
                password_hash=hash_password("123456"),
                role_id=1,
                warehouses=[1, 2],
                active=True,
                last_login=datetime(2026, 3, 10, tzinfo=timezone.utc),
            ),
            PocketUser(
                id=2,
                username="nika",
                password_hash=hash_password("123456"),
                role_id=2,
                warehouses=[1],
                active=True,
                last_login=datetime(2026, 3, 11, tzinfo=timezone.utc),
            ),
        ]
        db.add_all(pocket_users)
        db.commit()

        # Warehouse products
        warehouse_products = [
            WarehouseProduct(
                id=1,
                warehouse_id=1,
                barcode="460123000001",
                article_code="ART-001",
                product_name="Blue Shirt",
                price=49.99,
                stock_qty=15,
            ),
            WarehouseProduct(
                id=2,
                warehouse_id=1,
                barcode="460123000002",
                article_code="ART-002",
                product_name="Black Jeans",
                price=79.99,
                stock_qty=9,
            ),
            WarehouseProduct(
                id=3,
                warehouse_id=2,
                barcode="460123000003",
                article_code="ART-003",
                product_name="Red Hoodie",
                price=59.99,
                stock_qty=7,
            ),
        ]
        db.add_all(warehouse_products)
        db.commit()

        # Transfer
        transfer = Transfer(
            id=1,
            name="TBL to BAT",
            number="TR-0001",
            from_warehouse_id=1,
            to_warehouse_id=2,
            module="transfer",
            scan_type="barcode",
            status=TransferStatus.waiting_to_start,
            sender_user_ids=[1],
            receiver_user_ids=[1, 2],
            sender_recount_user_ids=[],
            receiver_recount_user_ids=[],
            signature_status=SignatureStatus.pending,
            description="desr dgf TBL to BAT",
            created_by=1,
            total_lines=2,
            sent_lines=1,
            received_lines=0,
            difference_lines=0,
            is_locked=False,
        )
        db.add(transfer)
        db.commit()

        transfer_lines = [
            TransferLine(
                id=1,
                document_id=1,
                product_id=1,
                barcode="460123000001",
                article_code="ART-001",
                product_name="Blue Shirt",
                color="Blue",
                size="xl",
                price=15.95,
                expected_qty=5,
                base_sent_qty=5,
                base_received_qty=0,

                sent_qty=5,
                received_qty=0,
                difference_qty=-5,
                base_sender_recount_qty=0,
                base_receiver_recount_qty=0,
                sender_recounted_qty=0,
                receiver_recounted_qty=0,
                sender_recount_requested=False,
                receiver_recount_requested=False,
            ),
            TransferLine(
                id=2,
                document_id=1,
                product_id=2,
                barcode="460123000002",
                article_code="ART-002",
                product_name="Black Jeans",
                color="Black",
                size="L",
                price=67.95,
                expected_qty=3,
                base_sent_qty=3,
                base_received_qty=0,

                sent_qty=0,
                received_qty=0,
                difference_qty=0,
                base_sender_recount_qty=0,
                base_receiver_recount_qty=0,
                sender_recounted_qty=0,
                receiver_recounted_qty=0,
                sender_recount_requested=False,
                receiver_recount_requested=False,
            ),
        ]
        db.add_all(transfer_lines)
        db.commit()

        # Inventorization
        inv = Inventorization(
            id=1,
            name="Central Count",
            warehouse_id=1,
            module="inventorization",
            scan_type="barcode",
            status=InventorizationStatus.waiting_to_start,
            description="Some description for Central Count inv",
            employees=[1, 2],
            recount_user_ids=[],
        )
        db.add(inv)
        db.commit()

        inventorization_lines = [
            InventorizationLine(
                id=1,
                document_id=1,
                barcode="460123000001",
                article_code="ART-001",
                product_name="Blue Shirt",
                color="Blue",
                size="xl",
                price=15.95,
                expected_qty=15,
                base_counted_qty=14,
                base_recount_qty=0,
                counted_qty=14,
                employee_id=1,
                recount_requested=False
            ),
            InventorizationLine(
                id=2,
                document_id=1,
                barcode="460123000002",
                article_code="ART-002",
                product_name="Black Jeans",
                color="Black",
                size="L",
                price=67.95,
                expected_qty=9,
                base_counted_qty=9,
                base_recount_qty=0,
                counted_qty=9,
                employee_id=2,
            ),
        ]
        db.add_all(inventorization_lines)
        db.commit()

        # Receive document
        receive = Receive(
            id=1,
            name="TBL Receive",
            number="RCV-0001",
            warehouse_id=1,
            module="receive",
            scan_type="barcode",
            status=ReceiveStatus.waiting_to_start,
            receiver_user_ids=[1, 2],
            recount_user_ids=[],
            created_by=1,
            description="SOme description for TBILisi receive",
            employees=[1, 2],
            total_lines=2,
            received_lines=1,
            difference_lines=0,
            is_locked=False,
        )

        db.add(receive)
        db.commit()

        receive_lines = [
            ReceiveLine(
                id=1,
                document_id=1,
                product_id=1,
                barcode="460123000001",
                article_code="ART-001",
                product_name="Blue Shirt",
                color="Blue",
                size="XL",
                price=15.95,
                expected_qty=5,
                base_counted_qty=5,
                base_recount_qty=0,
                counted_qty=5,
                difference_qty=0,
                recount_requested=False,
            ),
            ReceiveLine(
                id=2,
                document_id=1,
                product_id=2,
                barcode="460123000002",
                article_code="ART-002",
                product_name="Black Jeans",
                color="Black",
                size="L",
                price=67.95,
                expected_qty=3,
                base_counted_qty=2,
                base_recount_qty=0,
                counted_qty=2,
                difference_qty=-1,
                recount_requested=True,
            ),
        ]

        db.add_all(receive_lines)
        db.commit()

        # Price upload
        upload = PriceUpload(
            id=1,
            warehouse_id=1,
            file_name="price_list.xlsx",
            uploaded_by=1,
            rows_count=2,
            valid_rows_count=2,
            error_rows_count=0,
            duplicate_count=0,
            status=PriceUploadStatus.active,
            notes="Initial seed upload",
        )
        db.add(upload)
        db.commit()

        price_rows = [
            PriceRow(
                id=1,
                upload_id=1,
                warehouse_id=1,
                barcode="460123000001",
                name="Blue Shirt",
                category="Shirts",
                color="Blue",
                size="M",
                group_name="Men",
                article="ART-001",
                base_price=49.99,
                adjusted_price=39.99,
                price_type=PriceType.discounted,
            ),
            PriceRow(
                id=2,
                upload_id=1,
                warehouse_id=1,
                barcode="460123000002",
                name="Black Jeans",
                category="Pants",
                color="Black",
                size="32",
                group_name="Men",
                article="ART-002",
                base_price=79.99,
                adjusted_price=79.99,
                price_type=PriceType.none,
            ),
        ]
        db.add_all(price_rows)

        db.commit()

        document_assignments = [
            # Transfer
            DocumentAssignment(
                id=1,
                document_module=DocumentModule.transfer,
                document_id=1,
                pocket_user_id=1,
                role=AssignmentRole.sender,
                status=AssignmentStatus.waiting_to_start,
            ),
            DocumentAssignment(
                id=2,
                document_module=DocumentModule.transfer,
                document_id=1,
                pocket_user_id=1,
                role=AssignmentRole.receiver,
                status=AssignmentStatus.waiting_to_start,
            ),
            DocumentAssignment(
                id=3,
                document_module=DocumentModule.transfer,
                document_id=1,
                pocket_user_id=2,
                role=AssignmentRole.receiver,
                status=AssignmentStatus.waiting_to_start,
            ),

            # Inventorization
            DocumentAssignment(
                id=4,
                document_module=DocumentModule.inventorization,
                document_id=1,
                pocket_user_id=1,
                role=AssignmentRole.worker,
                status=AssignmentStatus.waiting_to_start,
            ),
            DocumentAssignment(
                id=5,
                document_module=DocumentModule.inventorization,
                document_id=1,
                pocket_user_id=2,
                role=AssignmentRole.worker,
                status=AssignmentStatus.waiting_to_start,
            ),

            # Receive
            DocumentAssignment(
                id=6,
                document_module=DocumentModule.receive,
                document_id=1,
                pocket_user_id=1,
                role=AssignmentRole.worker,
                status=AssignmentStatus.waiting_to_start,
            ),
            DocumentAssignment(
                id=7,
                document_module=DocumentModule.receive,
                document_id=1,
                pocket_user_id=2,
                role=AssignmentRole.worker,
                status=AssignmentStatus.waiting_to_start,
            ),
        ]

        db.add_all(document_assignments)
        db.commit()

        _reset_sequences(db)

    finally:
        db.close()