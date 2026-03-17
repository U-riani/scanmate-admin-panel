## backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.models.base import Base
from app.db.seed import seed_database

Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health():
    return {'status': 'ok'}

app.include_router(api_router, prefix='/api')
