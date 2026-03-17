from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import get_db
from app.models.models import WebsiteUser
from app.schemas.users import ResetPasswordRequest, WebsiteUserCreate, WebsiteUserRead, WebsiteUserUpdate
from app.services.utils import get_or_404, update_from_dict

router = APIRouter()

@router.get('', response_model=list[WebsiteUserRead])
def list_users(db: Session = Depends(get_db)):
    return db.scalars(select(WebsiteUser).order_by(WebsiteUser.id)).all()

@router.post('', response_model=WebsiteUserRead)
def create_user(payload: WebsiteUserCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={'password'})
    obj = WebsiteUser(**data, password_hash=hash_password(payload.password))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put('/{user_id}', response_model=WebsiteUserRead)
def update_user(user_id: int, payload: WebsiteUserUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, WebsiteUser, user_id, 'Website user not found')
    update_from_dict(obj, payload.model_dump(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.post('/{user_id}/reset-password')
def reset_password(user_id: int, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    obj = get_or_404(db, WebsiteUser, user_id, 'Website user not found')
    obj.password_hash = hash_password(payload.password)
    db.add(obj); db.commit()
    return {'success': True}

@router.delete('/{user_id}')
def delete_user(user_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, WebsiteUser, user_id, 'Website user not found')
    db.delete(obj); db.commit()
    return {'success': True}
