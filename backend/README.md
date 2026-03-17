# Scanmate Backend

FastAPI backend scaffold for your Scanmate admin panel. Because apparently frontends eventually need data instead of polite lies.

## Stack
- FastAPI
- SQLAlchemy 2
- SQLite by default
- PostgreSQL-ready via `DATABASE_URL`
- JWT auth

## Features
- Auth login
- Warehouses
- Website roles/users
- Pocket roles/users
- Transfers and transfer lines
- Inventorizations and inventorization lines
- Price uploads and barcode lookup
- Seed data matching the frontend mock structure

## Run
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open docs at `/docs`.

## Notes
- Default DB is SQLite for quick local testing.
- For production, set `DATABASE_URL` to PostgreSQL.
- CORS already allows the Vite frontend.
- Frontend currently still uses mock services, so you will need a final frontend API-wiring pass.
