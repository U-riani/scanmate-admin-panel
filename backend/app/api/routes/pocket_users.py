from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import get_db
from app.models.models import PocketUser
from app.schemas.users import PocketUserCreate, PocketUserRead, PocketUserUpdate, ResetPasswordRequest
from app.services.utils import get_or_404, update_from_dict

router = APIRouter()

@router.get('', response_model=list[PocketUserRead])
def list_users(db: Session = Depends(get_db)):
    return db.scalars(select(PocketUser).order_by(PocketUser.id)).all()

@router.post('', response_model=PocketUserRead)
def create_user(payload: PocketUserCreate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={'password'})
    obj = PocketUser(**data, password_hash=hash_password(payload.password))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.put('/{user_id}', response_model=PocketUserRead)
def update_user(user_id: int, payload: PocketUserUpdate, db: Session = Depends(get_db)):
    obj = get_or_404(db, PocketUser, user_id, 'Pocket user not found')
    update_from_dict(obj, payload.model_dump(exclude_unset=True))
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.post('/{user_id}/reset-password')
def reset_password(user_id: int, payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    obj = get_or_404(db, PocketUser, user_id, 'Pocket user not found')
    obj.password_hash = hash_password(payload.password)
    db.add(obj); db.commit()
    return {'success': True}

@router.delete('/{user_id}')
def delete_user(user_id: int, db: Session = Depends(get_db)):
    obj = get_or_404(db, PocketUser, user_id, 'Pocket user not found')
    db.delete(obj); db.commit()
    return {'success': True}
