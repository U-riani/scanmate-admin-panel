from fastapi import HTTPException
from sqlalchemy.orm import Session


def get_or_404(db: Session, model, obj_id: int, detail: str = 'Not found'):
    obj = db.get(model, obj_id)
    if not obj:
        raise HTTPException(status_code=404, detail=detail)
    return obj


def update_from_dict(obj, data: dict):
    for key, value in data.items():
        setattr(obj, key, value)
    return obj
