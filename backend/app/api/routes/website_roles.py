from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.models import WebsiteRole
from app.schemas.roles import WebsiteRoleCreate, WebsiteRoleRead, WebsiteRoleUpdate
from app.services.utils import get_or_404, update_from_dict

router = APIRouter()

@router.get('', response_model=list[WebsiteRoleRead])
def list_roles(db: Session = Depends(get_db)):
    return db.scalars(select(WebsiteRole).order_by(WebsiteRole.id)).all()

@router.post('', response_model=WebsiteRoleRead)
def create_role(payload: WebsiteRoleCreate, db: Session = Depends(get_db)):
    obj = WebsiteRole(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put('/{role_id}', response_model=WebsiteRoleRead)
def update_role(role_id: int, payload: WebsiteRoleUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, WebsiteRole, role_id, 'Role not found')
    update_from_dict(obj, payload.model_dump(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.delete('/{role_id}')
def delete_role(role_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, WebsiteRole, role_id, 'Role not found')
    db.delete(obj); db.commit()
    return {'success': True}
