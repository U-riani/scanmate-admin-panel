# backend/app/db/seed.py

from datetime import datetime, timezone
from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.models import Inventorization, InventorizationLine, PocketRole, PocketUser, PriceRow, PriceUpload, Transfer, TransferLine, Warehouse, WarehouseProduct, WebsiteRole, WebsiteUser
from app.models.enums import DocumentType, InventorizationStatus, PriceType, PriceUploadStatus, SignatureStatus, TransferStatus


def seed_database():
    db = SessionLocal()
    try:
        if db.scalar(select(WebsiteUser.id).limit(1)):
            return

        warehouses = [
            Warehouse(id=1, name='Tbilisi Central', code='TBL', active=True),
            Warehouse(id=2, name='Batumi Store', code='BAT', active=True),
            Warehouse(id=3, name='Kutaisi Store', code='KUT', active=True),
        ]
        db.add_all(warehouses)

        website_roles = [
            WebsiteRole(id=1, name='super_admin', description='Full system access', modules={
                'dashboard': True, 'users': True, 'transfer': True, 'sales': True, 'website_users': True,
                'website_roles': True, 'pocket_users': True, 'pocket_roles': True, 'warehouses': True,
                'settings': True, 'reports': True, 'inventorization': True, 'report': True, 'receive': True,
            }),
            WebsiteRole(id=2, name='admin', description='Operational admin', modules={
                'dashboard': True, 'transfer': True, 'sales': True, 'users': True, 'website_users': False,
                'website_roles': False, 'pocket_users': True, 'pocket_roles': True, 'warehouses': True,
                'settings': False, 'reports': True, 'inventorization': False,
            }),
        ]
        db.add_all(website_roles)

        pocket_roles = [
            PocketRole(id=1, name='warehouse_operator', description='Standard warehouse operator', modules={'inventorization': True, 'transfer': True, 'receive': False, 'sales': False}),
            PocketRole(id=2, name='warehouse_supervisor', description='Supervisor with wider permissions', modules={'inventorization': True, 'transfer': True, 'receive': True, 'sales': False}),
            PocketRole(id=3, name='warehouse_manager', description='Full access', modules={'inventorization': True, 'transfer': True, 'receive': True, 'sales': True}),
        ]
        db.add_all(pocket_roles)

        website_users = [
            WebsiteUser(id=1, username='super', email='super@scanmate.ge', password_hash=hash_password('123456'), role_id=1, warehouses=[1,2], active=True, last_login=datetime(2026,3,11, tzinfo=timezone.utc)),
            WebsiteUser(id=2, username='admin', email='admin@scanmate.ge', password_hash=hash_password('123456'), role_id=2, warehouses=[1], active=True, last_login=datetime(2026,3,10, tzinfo=timezone.utc)),
        ]
        db.add_all(website_users)

        pocket_users = [
            PocketUser(id=1, username='giorgi', password_hash=hash_password('123456'), role_id=1, warehouses=[1,2], active=True, last_login=datetime(2026,3,10, tzinfo=timezone.utc)),
            PocketUser(id=2, username='nika', password_hash=hash_password('123456'), role_id=2, warehouses=[1], active=True, last_login=datetime(2026,3,11, tzinfo=timezone.utc)),
        ]
        db.add_all(pocket_users)

        warehouse_products = [
            WarehouseProduct(id=1, warehouse_id=1, barcode='460123000001', article_code='ART-001', product_name='Blue Shirt', stock_qty=15),
            WarehouseProduct(id=2, warehouse_id=1, barcode='460123000002', article_code='ART-002', product_name='Black Jeans', stock_qty=9),
            WarehouseProduct(id=3, warehouse_id=2, barcode='460123000003', article_code='ART-003', product_name='Red Hoodie', stock_qty=7),
        ]
        db.add_all(warehouse_products)

        transfer = Transfer(id=1, name='TBL to BAT', number='TR-0001', from_warehouse_id=1, to_warehouse_id=2, type='internal', status=TransferStatus.draft, sender_user_id=1, receiver_user_id=2, signature_status=SignatureStatus.pending, created_by=1, total_lines=2, sent_lines=1, received_lines=0, difference_lines=0, is_locked=False)
        db.add(transfer)
        db.add_all([
            TransferLine(id=1, document_id=1, product_id=1, barcode='460123000001', article_code='ART-001', product_name='Blue Shirt', expected_qty=5, sent_qty=5, received_qty=0, difference_qty=-5),
            TransferLine(id=2, document_id=1, product_id=2, barcode='460123000002', article_code='ART-002', product_name='Black Jeans', expected_qty=3, sent_qty=0, received_qty=0, difference_qty=0),
        ])

        inv = Inventorization(id=1, name='Central Count', warehouse_id=1, type=DocumentType.barcode, doc_type=DocumentType.barcode, status=InventorizationStatus.draft, employees=[1,2])
        db.add(inv)
        db.add_all([
            InventorizationLine(id=1, document_id=1, barcode='460123000001', article_code='ART-001', product_name='Blue Shirt', expected_qty=15, counted_qty=14, recount_requested=True, employee_id=1),
            InventorizationLine(id=2, document_id=1, barcode='460123000002', article_code='ART-002', product_name='Black Jeans', expected_qty=9, counted_qty=9, recount_requested=False, employee_id=2),
        ])

        upload = PriceUpload(id=1, warehouse_id=1, file_name='price_list.xlsx', uploaded_by=1, rows_count=2, valid_rows_count=2, error_rows_count=0, duplicate_count=0, status=PriceUploadStatus.active, notes='Initial seed upload')
        db.add(upload)
        db.add_all([
            PriceRow(id=1, upload_id=1, warehouse_id=1, barcode='460123000001', name='Blue Shirt', category='Shirts', color='Blue', size='M', group_name='Men', article='ART-001', base_price=49.99, adjusted_price=39.99, price_type=PriceType.discounted),
            PriceRow(id=2, upload_id=1, warehouse_id=1, barcode='460123000002', name='Black Jeans', category='Pants', color='Black', size='32', group_name='Men', article='ART-002', base_price=79.99, adjusted_price=79.99, price_type=PriceType.none),
        ])

        db.commit()
    finally:
        db.close()
