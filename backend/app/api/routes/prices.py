from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import PriceType, PriceUploadStatus
from app.models.models import PriceRow, PriceUpload
from app.schemas.prices import AddPriceRowsRequest, PriceLookupResponse, PriceRowRead, PriceUploadCreate, PriceUploadCreateResponse, PriceUploadRead
from app.services.utils import get_or_404

router = APIRouter()


def get_price_type(base_price: float, adjusted_price: float) -> PriceType:
    if adjusted_price < base_price:
        return PriceType.discounted
    if adjusted_price > base_price:
        return PriceType.markup
    return PriceType.none


def normalize_rows(rows: list[dict]):
    errors = []
    prepared = []
    seen = {}
    duplicate_count = 0
    for index, row in enumerate(rows):
        barcode = str(row.get('barcode') or '').strip()
        if not barcode:
            errors.append({'row': index + 1, 'reason': 'Barcode is required'})
            continue
        try:
            base_price = float(row.get('base_price'))
            adjusted_price = float(row.get('adjusted_price'))
        except (TypeError, ValueError):
            errors.append({'row': index + 1, 'reason': 'Price values must be numeric'})
            continue
        normalized = {
            'barcode': barcode,
            'name': str(row.get('name') or '').strip(),
            'category': str(row.get('category') or '').strip(),
            'color': str(row.get('color') or '').strip(),
            'size': str(row.get('size') or '').strip(),
            'group_name': str(row.get('group') or row.get('group_name') or '').strip(),
            'article': str(row.get('article') or '').strip(),
            'base_price': base_price,
            'adjusted_price': adjusted_price,
            'price_type': get_price_type(base_price, adjusted_price),
        }
        if barcode in seen:
            duplicate_count += 1
        seen[barcode] = normalized
    prepared = list(seen.values())
    return prepared, errors, duplicate_count

@router.get('', response_model=list[PriceUploadRead])
def list_uploads(db: Session = Depends(get_db)):
    return db.scalars(select(PriceUpload).order_by(PriceUpload.id.desc())).all()

@router.get('/{upload_id}', response_model=PriceUploadRead)
def get_upload(upload_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, PriceUpload, upload_id, 'Upload not found')

@router.get('/{upload_id}/rows', response_model=list[PriceRowRead])
def get_rows(upload_id: int, db: Session = Depends(get_db)):
    return db.scalars(select(PriceRow).where(PriceRow.upload_id == upload_id).order_by(PriceRow.id)).all()

@router.get('/active/{warehouse_id}', response_model=PriceUploadRead | None)
def get_active_upload(warehouse_id: int, db: Session = Depends(get_db)):
    return db.scalar(select(PriceUpload).where(PriceUpload.warehouse_id == warehouse_id, PriceUpload.status == PriceUploadStatus.active).order_by(PriceUpload.id.desc()))

@router.post('', response_model=PriceUploadCreateResponse)
def create_upload(payload: PriceUploadCreate, db: Session = Depends(get_db)):
    prepared_rows, errors, duplicate_count = normalize_rows(payload.rows)
    db.query(PriceUpload).filter(PriceUpload.warehouse_id == payload.warehouse_id, PriceUpload.status == PriceUploadStatus.active).update({'status': PriceUploadStatus.archived})
    upload = PriceUpload(
        warehouse_id=payload.warehouse_id,
        file_name=payload.file_name,
        uploaded_by=payload.uploaded_by,
        rows_count=len(payload.rows),
        valid_rows_count=len(prepared_rows),
        error_rows_count=len(errors),
        duplicate_count=duplicate_count,
        status=PriceUploadStatus.active,
        notes=payload.notes,
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    created_rows = []
    for row in prepared_rows:
        obj = PriceRow(upload_id=upload.id, warehouse_id=payload.warehouse_id, **row)
        db.add(obj)
        created_rows.append(obj)
    db.commit()
    for row in created_rows:
        db.refresh(row)
    return {'upload': upload, 'rows': created_rows, 'errors': errors}

@router.post('/{upload_id}/activate', response_model=PriceUploadRead)
def activate_upload(upload_id: int, db: Session = Depends(get_db)):
    upload = get_or_404(db, PriceUpload, upload_id, 'Upload not found')
    db.query(PriceUpload).filter(PriceUpload.warehouse_id == upload.warehouse_id).update({'status': PriceUploadStatus.archived})
    upload.status = PriceUploadStatus.active
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

@router.post('/{upload_id}/archive', response_model=PriceUploadRead)
def archive_upload(upload_id: int, db: Session = Depends(get_db)):
    upload = get_or_404(db, PriceUpload, upload_id, 'Upload not found')
    upload.status = PriceUploadStatus.archived
    db.add(upload); db.commit(); db.refresh(upload)
    return upload

@router.post('/{upload_id}/rows', response_model=PriceUploadCreateResponse)
def add_rows(upload_id: int, payload: AddPriceRowsRequest, db: Session = Depends(get_db)):
    upload = get_or_404(db, PriceUpload, upload_id, 'Upload not found')
    prepared_rows, errors, duplicate_count = normalize_rows(payload.rows)
    created_rows = []
    for row in prepared_rows:
        obj = PriceRow(upload_id=upload.id, warehouse_id=upload.warehouse_id, **row)
        db.add(obj)
        created_rows.append(obj)
    upload.rows_count += len(payload.rows)
    upload.valid_rows_count += len(prepared_rows)
    upload.error_rows_count += len(errors)
    upload.duplicate_count += duplicate_count
    db.add(upload)
    db.commit()
    for row in created_rows:
        db.refresh(row)
    db.refresh(upload)
    return {'upload': upload, 'rows': created_rows, 'errors': errors}

@router.get('/lookup/by-barcode', response_model=PriceLookupResponse)
def lookup_barcode_price(warehouse_id: int = Query(...), barcode: str = Query(...), db: Session = Depends(get_db)):
    active_upload = db.scalar(select(PriceUpload).where(PriceUpload.warehouse_id == warehouse_id, PriceUpload.status == PriceUploadStatus.active).order_by(PriceUpload.id.desc()))
    if not active_upload:
        return {'found': False, 'barcode': barcode, 'warehouse_id': warehouse_id, 'reason': 'No active upload for warehouse'}
    row = db.scalar(select(PriceRow).where(PriceRow.upload_id == active_upload.id, PriceRow.barcode == str(barcode)).order_by(PriceRow.id.desc()))
    if not row:
        return {'found': False, 'barcode': barcode, 'warehouse_id': warehouse_id}
    return {'found': True, 'barcode': row.barcode, 'warehouse_id': row.warehouse_id, 'base_price': row.base_price, 'adjusted_price': row.adjusted_price, 'price_type': row.price_type, 'article': row.article, 'name': row.name}
