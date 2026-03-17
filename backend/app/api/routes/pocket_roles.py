from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import PocketRole
from app.schemas.roles import PocketRoleCreate, PocketRoleRead, PocketRoleUpdate
from app.services.utils import get_or_404, update_from_dict

router = APIRouter()

@router.get('', response_model=list[PocketRoleRead])
def list_roles(db: Session = Depends(get_db)):
    return db.scalars(select(PocketRole).order_by(PocketRole.id)).all()

@router.post('', response_model=PocketRoleRead)
def create_role(payload: PocketRoleCreate, db: Session = Depends(get_db)):
    obj = PocketRole(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put('/{role_id}', response_model=PocketRoleRead)
def update_role(role_id: int, payload: PocketRoleUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, PocketRole, role_id, 'Pocket role not found')
    update_from_dict(obj, payload.model_dump(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.delete('/{role_id}')
def delete_role(role_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, PocketRole, role_id, 'Pocket role not found')
    db.delete(obj); db.commit()
    return {'success': True}
