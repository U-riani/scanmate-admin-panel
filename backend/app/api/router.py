from fastapi import APIRouter

from app.api.routes import auth, warehouses, website_roles, website_users, pocket_roles, pocket_users, transfers, inventorization, pocket_api, prices, receive

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=['auth'])
api_router.include_router(warehouses.router, prefix='/warehouses', tags=['warehouses'])
api_router.include_router(website_roles.router, prefix='/website-roles', tags=['website-roles'])
api_router.include_router(website_users.router, prefix='/website-users', tags=['website-users'])
api_router.include_router(pocket_roles.router, prefix='/pocket-roles', tags=['pocket-roles'])
api_router.include_router(pocket_users.router, prefix='/pocket-users', tags=['pocket-users'])
api_router.include_router(transfers.router, prefix='/transfers', tags=['transfers'])
api_router.include_router(inventorization.router, prefix='/inventorization', tags=['inventorization'])
api_router.include_router(receive.router, prefix='/receive', tags=['receive'])
api_router.include_router(prices.router, prefix='/price-uploads', tags=['price-uploads'])
api_router.include_router(pocket_api.router, prefix='/pocket-api', tags=['pocket-api'])
