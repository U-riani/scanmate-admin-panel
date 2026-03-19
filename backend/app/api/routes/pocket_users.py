from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.security import hash_password, verify_password, create_access_token
from app.db.session import get_db
from app.models.models import PocketUser, PocketRole
from app.schemas.users import PocketUserCreate, PocketUserRead, PocketUserUpdate, ResetPasswordRequest
from app.schemas.auth import PocketLoginRequest, PocketLoginResponse
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


@router.post("/login", response_model=PocketLoginResponse)
def pocket_login(payload: PocketLoginRequest, db: Session = Depends(get_db)):
    print("LOGIN ENDPOINT HIT")
    user = db.scalar(
        select(PocketUser).where(PocketUser.username == payload.username)
    )

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.active:
        raise HTTPException(status_code=403, detail="User disabled")

    role = db.get(PocketRole, user.role_id)

    print("ROLE MODULES:", role.modules)

    if not role:
        raise HTTPException(status_code=500, detail="User role not found")

    token = create_access_token(str(user.id))

    user.last_login = datetime.now(timezone.utc)
    db.add(user)
    db.commit()

    return PocketLoginResponse(
        access_token=token,
        user_id=user.id,
        username=user.username,
        modules=dict(role.modules or {})
    )
