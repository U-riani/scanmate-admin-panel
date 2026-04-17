# ## backend/app/main.py

# from contextlib import asynccontextmanager
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.api.router import api_router
# from app.core.config import settings
# from app.db.session import engine
# from app.models.base import Base
# from app.db.seed import seed_database


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     Base.metadata.create_all(bind=engine)
#     seed_database()
#     yield


# app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins_list,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get('/health')
# def health():
#     return {'status': 'ok'}


# app.include_router(api_router, prefix='/api')


from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import engine
from app.models.base import Base
from app.db.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Starting application...")
        print(f"APP_ENV: {settings.APP_ENV}")
        print("Initializing database tables...")
        Base.metadata.create_all(bind=engine)

        print("Running seed_database()...")
        seed_database()

        print("Startup completed successfully.")
    except Exception as e:
        print(f"Startup failed: {e}")
        raise

    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")