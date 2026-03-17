from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import DocumentType, InventorizationStatus
from app.models.models import Inventorization, InventorizationLine, WarehouseProduct
from app.schemas.inventorizations import ImportRowsRequest, ImportRowsResponse, InventorizationCreate, InventorizationLineRead, InventorizationRead, InventorizationStatusUpdate, MarkRecountRequest, PreloadLinesRequest, RecountCreateRequest, RecountCreateResponse
from app.services.utils import get_or_404

router = APIRouter()

@router.get('', response_model=list[InventorizationRead])
def list_docs(db: Session = Depends(get_db)):
    return db.scalars(select(Inventorization).order_by(Inventorization.id.desc())).all()

@router.post('', response_model=InventorizationRead)
def create_doc(payload: InventorizationCreate, db: Session = Depends(get_db)):
    obj = Inventorization(**payload.model_dump(), status=InventorizationStatus.draft)
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.patch('/{doc_id}/status', response_model=InventorizationRead)
def update_status(doc_id: int, payload: InventorizationStatusUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Inventorization, doc_id, 'Document not found')
    obj.status = payload.status
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get('/{doc_id}/lines', response_model=list[InventorizationLineRead])
def list_lines(doc_id: int, db: Session = Depends(get_db)):
    return db.scalars(select(InventorizationLine).where(InventorizationLine.document_id == doc_id).order_by(InventorizationLine.id)).all()

@router.post('/{doc_id}/preload-lines', response_model=list[InventorizationLineRead])
def preload_lines(doc_id: int, payload: PreloadLinesRequest, db: Session = Depends(get_db)):
    get_or_404(db, Inventorization, doc_id, 'Document not found')
    products = db.scalars(select(WarehouseProduct).where(WarehouseProduct.warehouse_id == payload.warehouse_id)).all()
    created = []
    for p in products:
        line = InventorizationLine(document_id=doc_id, barcode=p.barcode, article_code=p.article_code, product_name=p.product_name, expected_qty=p.stock_qty, counted_qty=0)
        db.add(line)
        created.append(line)
    db.commit()
    for line in created:
        db.refresh(line)
    return created

@router.post('/{doc_id}/import-lines', response_model=ImportRowsResponse)
def import_lines(doc_id: int, payload: ImportRowsRequest, db: Session = Depends(get_db)):
    get_or_404(db, Inventorization, doc_id, 'Document not found')
    errors = []
    imported = 0
    for index, row in enumerate(payload.rows):
        barcode = str(row.get('Barcode') or '').strip()
        if not barcode:
            errors.append({'row': index + 2, 'reason': 'Barcode missing'})
            continue
        line = InventorizationLine(
            document_id=doc_id,
            barcode=barcode,
            article_code=row.get('Article') or '',
            product_name=row.get('Product') or '',
            expected_qty=int(row.get('Expected Qty') or 0),
            counted_qty=None,
        )
        db.add(line)
        imported += 1
    db.commit()
    return {'imported': imported, 'errors': errors}

@router.post('/mark-recount')
def mark_recount(payload: MarkRecountRequest, db: Session = Depends(get_db)):
    lines = db.scalars(select(InventorizationLine).where(InventorizationLine.id.in_(payload.line_ids))).all()
    for line in lines:
        line.recount_requested = True
        db.add(line)
    db.commit()
    return {'success': True}

@router.post('/recount', response_model=RecountCreateResponse)
def create_recount(payload: RecountCreateRequest, db: Session = Depends(get_db)):
    doc = Inventorization(
        name=f'Recount for Doc {payload.parent_document_id}',
        warehouse_id=payload.warehouse_id,
        type=DocumentType.barcode,
        doc_type=DocumentType.recount,
        parent_document_id=payload.parent_document_id,
        status=InventorizationStatus.draft,
        employees=payload.employees,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    created = []
    for item in payload.items:
        line = InventorizationLine(
            document_id=doc.id,
            barcode=item.barcode,
            article_code=item.article_code,
            product_name=item.product_name,
            expected_qty=item.counted_qty or 0,
            counted_qty=None,
            recount_qty=None,
            recount_requested=False,
            employee_id=None,
        )
        db.add(line)
        created.append(line)
    db.commit()
    for line in created:
        db.refresh(line)
    return {'document': doc, 'lines': created}
