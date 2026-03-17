from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseRead, WarehouseUpdate
from app.services.utils import get_or_404, update_from_dict

router = APIRouter()

@router.get('', response_model=list[WarehouseRead])
def list_warehouses(db: Session = Depends(get_db)):
    return db.scalars(select(Warehouse).order_by(Warehouse.id)).all()

@router.post('', response_model=WarehouseRead)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db)):
    obj = Warehouse(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put('/{warehouse_id}', response_model=WarehouseRead)
def update_warehouse(warehouse_id: int, payload: WarehouseUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, Warehouse, warehouse_id, 'Warehouse not found')
    update_from_dict(obj, payload.model_dump(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.delete('/{warehouse_id}')
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, Warehouse, warehouse_id, 'Warehouse not found')
    db.delete(obj); db.commit()
    return {'success': True}
