from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.db.session import get_db
from app.models.models import WebsiteRole, WebsiteUser
from app.schemas.auth import LoginRequest, LoginResponse, LoginUser

router = APIRouter()


@router.post('/login', response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(WebsiteUser).where(WebsiteUser.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    if not user.active:
        raise HTTPException(status_code=403, detail='User is inactive')

    role = db.get(WebsiteRole, user.role_id)
    if not role:
        raise HTTPException(status_code=403, detail='User role not found')
    user.last_login = datetime.now(timezone.utc)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return LoginResponse(
        access_token=token,
        user=LoginUser(
            id=user.id,
            email=user.email,
            username=user.username,
            role_id=role.id,
            role=role,
            warehouses=user.warehouses or [],
        ),
    )
