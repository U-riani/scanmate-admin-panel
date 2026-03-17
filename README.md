# Scanmate Fullstack Connected

Frontend and backend are now wired together, because mock data eventually becomes an elaborate form of lying.

## What is included
- `frontend/` - React + Vite admin panel connected to backend APIs
- `backend/` - FastAPI backend with SQLite default setup and PostgreSQL-ready config

## Default login
- `super@scanmate.ge` / `123456`
- `admin@scanmate.ge` / `123456`

## Run backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend URL:
- `http://localhost:8000`
- Docs: `http://localhost:8000/docs`

## Run frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL:
- `http://localhost:5173`

## Connected modules
- Auth login
- Warehouses
- Website roles
- Website users
- Pocket roles
- Pocket users
- Transfers
- Transfer lines
- Inventorizations
- Inventorization lines
- Price uploads
- Barcode price lookup

## Notes
- Frontend now reads from FastAPI instead of local mock arrays for the main modules.
- JWT token is stored after login and attached automatically to API requests.
- Backend routes currently work even without token enforcement, but the frontend is ready for stricter auth later.
# scanmate-admin-panel
