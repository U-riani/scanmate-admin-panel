# Scanmate Admin Panel

A full-stack warehouse operations and inventory management platform. The system provides an admin web console for managing warehouses, stock counts, inter-warehouse transfers, incoming goods, price lists, and user access. A separate mobile app (Pocket) consumes the same backend API for on-the-floor warehouse scanning operations.

---

## Table of Contents

1. [What the System Does](#1-what-the-system-does)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Getting Started](#5-getting-started)
6. [Environment Variables](#6-environment-variables)
7. [Default Login Credentials](#7-default-login-credentials)
8. [Application Modules](#8-application-modules)
   - [Dashboard](#dashboard)
   - [Inventorization](#inventorization)
   - [Transfer](#transfer)
   - [Receive](#receive)
   - [Sales / Price Management](#sales--price-management)
   - [User Management](#user-management)
   - [Settings / Warehouses](#settings--warehouses)
9. [Document Workflow & Statuses](#9-document-workflow--statuses)
10. [Role-Based Access Control](#10-role-based-access-control)
11. [Frontend Architecture](#11-frontend-architecture)
12. [Backend Architecture](#12-backend-architecture)
13. [API Reference](#13-api-reference)
14. [Data Models](#14-data-models)
15. [Authentication & Security](#15-authentication--security)
16. [UI Design System](#16-ui-design-system)
17. [Excel Import / Export](#17-excel-import--export)
18. [Build & Deployment](#18-build--deployment)
19. [Contributing & Branch Strategy](#19-contributing--branch-strategy)

---

## 1. What the System Does

Scanmate is a **warehouse management system (WMS)** built for multi-warehouse businesses. It digitizes and tracks the full lifecycle of warehouse operations:

| Operation | What it means |
|-----------|--------------|
| **Inventorization** | Employees physically count stock in a warehouse. Discrepancies trigger a recount workflow before the count is confirmed and closed. |
| **Transfer** | Goods move from one warehouse to another. The sending warehouse packs and confirms dispatch; the receiving warehouse confirms receipt. Both sides can request a recount if quantities don't match. |
| **Receive** | Incoming goods (from suppliers or other sources) are logged, scanned, and confirmed. |
| **Price Management** | Price lists are uploaded per warehouse. Each list has a base price and an adjusted (markup or discounted) price. Lists are activated or archived as needed. A barcode lookup tool allows instant price checks. |
| **User Management** | Two classes of users exist: website users (who log into this admin panel) and pocket users (who use the mobile scanning app). Each class has its own roles and module permissions. |

The platform enforces a **role-based access control** system. Access to each module (inventorization, transfer, receive, sales, users, settings) is granted per role. Super admins have unrestricted access. Regular admins only see modules assigned to their role.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────┐
│         Browser (Admin Panel)        │
│   React 19 · Vite · Tailwind CSS     │
│   Zustand (auth, warehouse state)    │
│   React Query (server state cache)   │
└───────────────┬─────────────────────┘
                │  HTTPS / REST JSON
                │  JWT Bearer token
┌───────────────▼─────────────────────┐
│         FastAPI Backend              │
│   Python 3.11+ · SQLAlchemy 2        │
│   Pydantic validation                │
│   bcrypt password hashing            │
│   JWT (python-jose, HS256)           │
└───────────────┬─────────────────────┘
                │  SQLAlchemy ORM
┌───────────────▼─────────────────────┐
│         PostgreSQL Database          │
│   (SQLite supported for local dev)   │
└─────────────────────────────────────┘
```

- The **frontend** is a single-page application (SPA) that communicates with the backend exclusively via REST API calls.
- The **backend** is stateless. Every request must carry a valid JWT token (except the `/auth/login` endpoint).
- The **database** is PostgreSQL in production. SQLite works for quick local testing.
- A **mobile app (Pocket)** uses the same backend under the `/api/pocket-api` namespace.

---

## 3. Tech Stack

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| Build tool | Vite + SWC | 7.3.1 |
| UI framework | React | 19.2.0 |
| Routing | react-router-dom | 7.13.1 |
| Global state | Zustand | 5.0.11 |
| Server state / caching | TanStack React Query | 5.90.21 |
| Styling | Tailwind CSS | 4.2.1 |
| Notifications | react-hot-toast | 2.6.0 |
| Spreadsheet I/O | xlsx (SheetJS) | 0.18.5 |
| Linting | ESLint | 9.39.1 |

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | FastAPI | 0.115.12 |
| ORM | SQLAlchemy | 2.0.39 |
| Schema validation | Pydantic + pydantic-settings | 2.10.6 |
| Database driver | psycopg2-binary (PostgreSQL) | 2.9.11 |
| JWT | python-jose | 3.3.0 |
| Password hashing | bcrypt + passlib | 4.0.1 / 1.7.4 |
| Server | uvicorn | 0.34.0 |
| Environment config | python-dotenv | 1.2.2 |

---

## 4. Project Structure

```
scanmate-admin-panel/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── routes.jsx          # All app routes with auth guards
│   │   │   ├── paths.js            # Centralized path constants
│   │   │   └── queryKeys.js        # React Query cache key registry
│   │   ├── api/
│   │   │   ├── apiClient.js        # Axios instance with auth header injection
│   │   │   ├── authService.js
│   │   │   ├── warehouseService.js
│   │   │   ├── inventorizationService.js
│   │   │   ├── inventorizationLinesService.js
│   │   │   ├── inventorizationRecountService.js
│   │   │   ├── transferService.js
│   │   │   ├── transferLinesService.js
│   │   │   ├── receiveService.js
│   │   │   ├── priceUploadService.js
│   │   │   ├── priceLookupService.js
│   │   │   ├── pocketRolesService.js
│   │   │   ├── pocketUsersService.js
│   │   │   ├── websiteUsersService.js
│   │   │   ├── websiteRolesService.js
│   │   │   └── usersService.js
│   │   ├── components/
│   │   │   ├── Layout.jsx                      # App shell (header + sidebar + outlet)
│   │   │   ├── Sidebar.jsx                     # Navigation with module-based visibility
│   │   │   ├── WarehouseSelector.jsx            # Global warehouse filter dropdown
│   │   │   ├── ProtectedRoute.jsx               # Redirects unauthenticated users
│   │   │   ├── RoleRoute.jsx                    # Restricts by user role
│   │   │   ├── ModuleRoute.jsx                  # Restricts by module permission
│   │   │   ├── StatusBadge.jsx                  # Colored status label chip
│   │   │   ├── StatusBarComponent.jsx           # Progress bar for workflow stages
│   │   │   ├── CreateInventorizationModal.jsx
│   │   │   ├── ImportInventorizationExcelModal.jsx
│   │   │   ├── TransferCreateModal.jsx
│   │   │   ├── WarehouseProductSelector.jsx
│   │   │   ├── CreateReceiveModal.jsx
│   │   │   ├── ImportReceiveExcelModal.jsx
│   │   │   ├── PriceLookupBox.jsx
│   │   │   ├── CreatePriceListModal.jsx
│   │   │   ├── UploadPriceListModal.jsx
│   │   │   ├── ImportPriceExcelModal.jsx
│   │   │   ├── CreateWarehouseModal.jsx
│   │   │   ├── EditWarehouseModal.jsx
│   │   │   ├── AddProductModal.jsx
│   │   │   ├── CreatePocketRoleModal.jsx
│   │   │   ├── CreateWebsiteRoleModal.jsx
│   │   │   ├── CreatePocketUserModal.jsx
│   │   │   ├── CreateWebsiteUserModal.jsx
│   │   │   ├── EditUserModal.jsx
│   │   │   ├── EditWebsiteUserModal.jsx
│   │   │   ├── ResetPasswordModal.jsx
│   │   │   └── ResetWebsitePasswordModal.jsx
│   │   ├── pages/
│   │   │   ├── auth/               # Login.jsx
│   │   │   ├── dashboard/          # Dashboard.jsx
│   │   │   ├── inventorization/    # InventorizationList.jsx, InventorizationDetail.jsx
│   │   │   ├── transfer/           # TransferList.jsx, TransferDetail.jsx
│   │   │   ├── receive/            # Receive.jsx, ReceiveDetail.jsx
│   │   │   ├── sales/              # PriceLists.jsx, PriceUploadDetail.jsx
│   │   │   ├── report/             # Report.jsx (placeholder)
│   │   │   ├── users/              # Users.jsx, WebsiteUsers.jsx, WebsiteRoles.jsx,
│   │   │   │                       # PocketUsers.jsx, PocketRoles.jsx
│   │   │   ├── settings/           # Settings.jsx, Warehouses.jsx
│   │   │   ├── api/                # Api.jsx (placeholder)
│   │   │   └── roles-permissions/  # RolesPermissions.jsx
│   │   ├── queries/                # 29 React Query hooks (one file per resource)
│   │   ├── store/
│   │   │   ├── authStore.js        # Zustand: current user, JWT token, session methods
│   │   │   └── warehouseStore.js   # Zustand: selected warehouse for filtering
│   │   ├── constants/
│   │   │   ├── statusData.js       # Status label/color maps
│   │   │   ├── storageKeys.js      # localStorage key constants
│   │   │   └── statusFlows.js      # Allowed status transitions per document type
│   │   ├── config/
│   │   │   ├── menuData.js         # Sidebar navigation items and module mapping
│   │   │   ├── modules.js          # Module name constants
│   │   │   └── permissions.js      # Permission name constants
│   │   ├── utils/
│   │   │   ├── storage.js          # Thin wrappers around localStorage
│   │   │   ├── permissions.js      # Permission check helpers
│   │   │   └── excelUtils.js       # Excel read/write helpers (SheetJS)
│   │   ├── hooks/
│   │   │   └── usePermission.js    # Hook to check current user's module access
│   │   ├── assets/                 # Logos and static images
│   │   └── index.css               # Tailwind base + CSS custom properties (design tokens)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── backend/
    ├── app/
    │   ├── main.py                 # FastAPI app factory, CORS setup, router mount
    │   ├── api/
    │   │   ├── router.py           # Aggregates all route modules under /api
    │   │   ├── deps.py             # Dependency injection (DB session, current user)
    │   │   └── routes/
    │   │       ├── auth.py
    │   │       ├── warehouses.py
    │   │       ├── transfers.py
    │   │       ├── transfer_lines.py
    │   │       ├── inventorization.py
    │   │       ├── inventorization_lines.py
    │   │       ├── receive.py
    │   │       ├── price.py
    │   │       ├── website_users.py
    │   │       ├── website_roles.py
    │   │       ├── pocket_users.py
    │   │       └── pocket_roles.py
    │   ├── models/
    │   │   ├── models.py           # All SQLAlchemy ORM table definitions
    │   │   ├── enums.py            # Python Enum classes for status, roles, document types
    │   │   └── base.py             # Declarative base + shared id/timestamp columns
    │   ├── schemas/                # Pydantic request/response models (9 files)
    │   ├── services/               # Business logic (transfer workflow, assignments, utils)
    │   ├── core/
    │   │   ├── config.py           # Reads environment variables into a Settings object
    │   │   └── security.py         # JWT creation/validation, bcrypt password hashing
    │   └── db/
    │       ├── session.py          # SQLAlchemy engine + SessionLocal factory
    │       └── seed.py             # Seeds the database with sample warehouses & users
    ├── requirements.txt
    └── .env.example
```

---

## 5. Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **PostgreSQL** 14+ (or SQLite for quick local testing)

### Run the Backend

```bash
cd backend
python -m venv .venv

# Activate the virtual environment:
# Windows:
.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env — set DB_* variables to point at your database

uvicorn app.main:app --reload
```

- Backend runs at: `http://localhost:8000`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`
- The seed script runs automatically on first startup if the database is empty.

### Run the Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api  (default, no change needed for local dev)

npm run dev
```

- Frontend runs at: `http://localhost:5173`

### Run Both Together (from the project root)

If you have two terminals open:

```bash
# Terminal 1
cd backend && uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

---

## 6. Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:8000/api` | Base URL for all API calls |

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APP_NAME` | No | `Scanmate Backend` | Application display name |
| `APP_ENV` | No | `development` | `development` or `production` |
| `SECRET_KEY` | **Yes** | `change-this-...` | JWT signing secret. **Must be changed in production.** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `1440` | JWT lifetime in minutes (default 24 hours) |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USER` | Yes | `postgres` | Database user |
| `DB_PASSWORD` | Yes | `postgres` | Database password |
| `DB_NAME` | Yes | `scanmate` | Database name |
| `CORS_ORIGINS` | No | `http://localhost:5173,...` | Comma-separated allowed origins |

> **Production checklist:**
> - Set a strong random `SECRET_KEY` (at least 32 characters).
> - Set `APP_ENV=production`.
> - Point `DB_*` variables at your production PostgreSQL instance.
> - Restrict `CORS_ORIGINS` to your actual domain(s).

---

## 7. Default Login Credentials

These accounts are created by the database seeder on first run.

| Email | Password | Role |
|-------|----------|------|
| `super@scanmate.ge` | `123456` | Super Admin — full unrestricted access |
| `admin@scanmate.ge` | `123456` | Admin — configurable module access |

> Change these passwords immediately in any non-local environment.

---

## 8. Application Modules

### Dashboard

**URL:** `/`

The dashboard provides an at-a-glance overview of warehouse operations:

- Total number of warehouses in the system.
- Count of active transfers grouped by status.
- Count of active inventorizations grouped by status.
- The logged-in user's name and role badge.
- A system status banner.

No actions are taken from the dashboard — it is a read-only summary view.

---

### Inventorization

**URLs:** `/inventorization` (list), `/inventorization/:id` (detail)

An inventorization is a **stock count operation** where warehouse employees physically count all items in a warehouse and reconcile the counts against the system records.

**Key concepts:**
- Each inventorization belongs to one warehouse.
- One or more **workers** are assigned to the count.
- Items can be preloaded from the warehouse's existing inventory, or imported in bulk from an Excel file.
- After scanning is complete, if counts don't match expected quantities, a **recount** is requested.
- The document moves through a defined status workflow (see [Section 9](#9-document-workflow--statuses)).
- Once the count is confirmed and closed, the warehouse inventory is updated.

**Features:**
- Create new inventorization with warehouse and worker assignment.
- View all line items (product, expected quantity, scanned quantity, discrepancy).
- Trigger recount on specific lines or the full document.
- Bulk import lines from Excel (template: barcode, product name, quantity).
- Preload all current warehouse products as lines.
- Change status through the workflow via action buttons.

---

### Transfer

**URLs:** `/transfer-list` (list), `/transfer/:id` (detail)

A transfer tracks the **movement of goods from one warehouse (sender) to another (receiver)**.

**Key concepts:**
- A transfer has two parties: the **sending warehouse** and the **receiving warehouse**.
- The sender packs items and confirms dispatch. The receiver confirms receipt.
- Either party can request a recount if quantities don't match.
- Items are tracked by barcode and **Box ID** (a physical box identifier).
- Both parties go through separate in-progress and completion states.
- Digital signing is supported at key workflow steps.

**Features:**
- Create transfer specifying source warehouse, destination warehouse, and items.
- Sender phase: add/edit line items, confirm packing complete.
- Receiver phase: confirm received items and quantities.
- Recount request and recount workflow for both sender and receiver.
- Status progress bar showing current phase.
- Line-level quantity tracking with discrepancy highlighting.

---

### Receive

**URLs:** `/receive` (list), `/receive/:id` (detail)

A receive document tracks **incoming goods**, typically from an external supplier or an external delivery.

**Key concepts:**
- Similar structure to inventorization but represents goods arriving at the warehouse.
- Workers are assigned to the receive operation.
- Items are scanned in; counts are compared to expected quantities.
- A recount workflow exists for discrepancies.

**Features:**
- Create receive with warehouse and worker assignment.
- Line items with expected vs. actual quantities.
- Bulk import from Excel.
- Preload expected items from warehouse inventory.
- Recount workflow.
- Status progression identical to inventorization.

---

### Sales / Price Management

**URLs:** `/sales/price-lists` (list), `/sales/price-lists/:id` (detail)

Price management allows uploading and activating price lists per warehouse.

**Key concepts:**
- A **price upload** is a set of product prices associated with a specific warehouse.
- Each row has a **base price** and an **adjusted price**.
  - If adjusted > base → classified as **markup**.
  - If adjusted < base → classified as **discounted**.
  - If equal → classified as **none**.
- Only one price list can be **active** per warehouse at a time. Activating a new list automatically archives the previous active list.
- The **price lookup** tool allows barcode scanning or manual barcode entry to instantly retrieve the current price.

**Features:**
- Create a new empty price list for a warehouse.
- Upload a pre-filled price list (bulk import from Excel).
- View all rows in a price upload with base and adjusted prices.
- Activate or archive a price list.
- Price lookup by barcode (shows base price, adjusted price, and price type).

---

### User Management

**URLs:** `/users/website-users`, `/users/website-roles`, `/users/pocket-users`, `/users/pocket-roles`

The system has **two separate user classes**:

#### Website Users
Administrators who log into this web panel.
- Created with email + password.
- Assigned a **website role** that controls which modules they can access.
- Can be assigned to one or more warehouses to limit their operational scope.
- Can be activated or deactivated.

#### Pocket Users
Employees who use the mobile scanning app (Pocket).
- Created with username + password (no email required).
- Assigned a **pocket role**.
- Have warehouse assignments.

#### Roles
- Each role has a set of **modules** enabled (e.g., inventorization, transfer, receive, sales, users, settings).
- The sidebar and routes automatically hide modules the user's role does not include.
- Super Admin has all modules and bypasses module checks.

**Features:**
- Create, edit, deactivate users.
- Assign roles and warehouses.
- Reset passwords.
- View and manage roles with module permission toggles.

---

### Settings / Warehouses

**URLs:** `/settings/warehouses`

Accessible by super admins only.

- Create warehouses with a name and a unique warehouse code.
- Edit existing warehouse details.
- Activate or deactivate warehouses.
- Add products to a warehouse's product catalog (used as the source for preloading lines in inventorizations and receives).

---

## 9. Document Workflow & Statuses

All three operational document types (inventorization, transfer, receive) follow a formal status workflow. Status transitions are enforced by the backend; the frontend renders available action buttons based on the current status.

### Inventorization & Receive Status Flow

```
draft
  └─► waiting_to_start
        └─► in_progress
              └─► scanning_completed
                    ├─► confirmed          (no discrepancies)
                    └─► recount_requested
                          └─► recount_in_progress
                                └─► recount_completed
                                      └─► confirmed
                                            └─► closed
```

### Transfer Status Flow

```
draft
  └─► waiting_to_start
        └─► sender_in_progress
              └─► sender_completed
                    ├─► sender_recount_requested
                    │     └─► sender_recount_in_progress
                    │           └─► sender_recount_completed
                    └─► waiting_receiver_to_start
                          └─► receive_in_progress
                                └─► receive_completed
                                      ├─► receive_recount_requested
                                      │     └─► receive_recount_in_progress
                                      │           └─► receive_recount_completed
                                      └─► closed
```

### Status Display

Each status is displayed as a colored badge:

| Status group | Color |
|-------------|-------|
| Draft | Gray |
| Waiting / Pending | Yellow |
| In Progress | Blue |
| Completed | Teal |
| Recount states | Orange |
| Confirmed / Closed | Green |

A horizontal **status progress bar** at the top of each detail page shows the current position in the workflow.

---

## 10. Role-Based Access Control

### System Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access to everything. Bypasses all module and permission checks. |
| `admin` | Access limited to modules assigned in the user's website role. |

### Modules

The following modules can be enabled or disabled per role:

| Module key | What it covers |
|-----------|---------------|
| `dashboard` | Dashboard page |
| `inventorization` | Inventorization list and detail |
| `transfer` | Transfer list and detail |
| `receive` | Receive list and detail |
| `sales` | Price lists and price lookup |
| `users` | User management sub-pages |
| `website_users` | Website user CRUD |
| `website_roles` | Website role management |
| `pocket_users` | Pocket user CRUD |
| `pocket_roles` | Pocket role management |
| `settings` | Settings pages |
| `warehouses` | Warehouse management |

### How It Works

1. After login, the user's role and permitted modules are stored in the Zustand `authStore`.
2. Every route is wrapped in a `ModuleRoute` component. If the user's role does not include the required module, they are redirected to a "not authorized" screen.
3. The `Sidebar` component reads the same module list and only renders navigation items the user can access.
4. The `usePermission` hook provides a programmatic way to check access inside any component.

---

## 11. Frontend Architecture

### Routing

Routes are defined in `src/app/routes.jsx` using react-router-dom v7. Three guard components wrap protected content:

- **`ProtectedRoute`** — Redirects to `/login` if no valid session exists.
- **`RoleRoute`** — Restricts a route to a specific role (e.g., `super_admin` only for warehouse settings).
- **`ModuleRoute`** — Restricts a route to users whose role includes a specific module key.

### State Management

**Zustand stores (global client state):**

- `authStore` — Holds `user` object, `token` string, `setSession(user, token)` and `logout()` methods. Persisted to localStorage under `scanmate_user` and `scanmate_token`.
- `warehouseStore` — Holds `selectedWarehouseId`. Used across all list pages to filter data by warehouse. Persisted to localStorage under `scanmate_warehouse_id`.

**React Query (server state):**

- All API calls are wrapped in React Query hooks located in `src/queries/`.
- Query keys are centralized in `src/app/queryKeys.js` to prevent cache key collisions.
- On mutations (create, update, delete), the relevant query cache is invalidated to trigger a fresh fetch.
- React Query DevTools are enabled in development mode.

**Component-local state:**

- Modal open/close state, form inputs, and temporary UI toggles use `useState`.

### API Client

`src/api/apiClient.js` is an Axios instance pre-configured with:
- `baseURL` pointing to `VITE_API_URL`.
- A request interceptor that reads the JWT token from the Zustand `authStore` and injects it as the `Authorization: Bearer <token>` header on every request.
- A response interceptor that catches `401 Unauthorized` responses, calls `logout()`, and redirects to `/login`.

### Service Layer

Each resource has a dedicated service file in `src/api/`. All functions return the Axios promise directly. React Query hooks in `src/queries/` call these service functions and handle loading, error, and success states.

Example pattern:
```js
// api/inventorizationService.js
export const getInventorizations = (warehouseId) =>
  apiClient.get("/inventorization", { params: { warehouse_id: warehouseId } });

// queries/useInventorizations.js
export const useInventorizations = (warehouseId) =>
  useQuery({
    queryKey: queryKeys.inventorizations(warehouseId),
    queryFn: () => getInventorizations(warehouseId).then(r => r.data),
  });
```

---

## 12. Backend Architecture

### FastAPI Application

`backend/app/main.py` creates the FastAPI app, configures CORS (reading allowed origins from `Settings`), and mounts the main API router at `/api`.

### Dependency Injection (`deps.py`)

Two FastAPI dependencies are available for injection into route handlers:

- `get_db` — Yields a `SessionLocal` database session and ensures it is closed after the request.
- `get_current_user` — Decodes the JWT from the `Authorization` header, queries the user from the database, and raises `401` if invalid.

### Models (`models/models.py`)

All database tables are defined as SQLAlchemy ORM classes. Key tables:

| Table | Description |
|-------|-------------|
| `website_users` | Admin panel user accounts |
| `website_roles` | Admin panel roles with module permission bitmask |
| `pocket_users` | Mobile app user accounts |
| `pocket_roles` | Mobile app roles |
| `warehouses` | Warehouse locations with code and status |
| `warehouse_products` | Product catalog per warehouse |
| `inventorization` | Stock count document headers |
| `inventorization_lines` | Line items within a stock count |
| `inventorization_assignments` | Worker assignments to a stock count |
| `transfers` | Transfer document headers |
| `transfer_lines` | Line items within a transfer |
| `transfer_assignments` | Sender/receiver assignments |
| `receive` | Receive document headers |
| `receive_lines` | Line items within a receive |
| `receive_assignments` | Worker assignments |
| `price_uploads` | Price list headers per warehouse |
| `price_rows` | Individual product prices within a price list |

### Enums (`models/enums.py`)

Python `Enum` classes used for strict value validation:

- `TransferStatus` — All transfer workflow states.
- `InventorizationStatus` — All inventorization/receive workflow states.
- `DocumentModule` — `inventorization`, `transfer`, `receive`, `sale`.
- `AssignmentRole` — `worker`, `sender`, `receiver`.
- `PriceType` — `markup`, `discounted`, `none`.
- `UserRole` — `super_admin`, `admin`.

### Services (`services/`)

Business logic is separated from route handlers:

- `transfer_service.py` — Status transition validation and transfer workflow logic.
- `assignment_service.py` — Creating and validating worker/sender/receiver assignments.
- `utils.py` — Shared helpers (e.g., quantity reconciliation).

### Database Seeding (`db/seed.py`)

On first startup, if no warehouses exist, the seeder creates:
- Sample warehouses.
- A super admin user (`super@scanmate.ge` / `123456`).
- An admin user (`admin@scanmate.ge` / `123456`).
- Sample website and pocket roles.

---

## 13. API Reference

Full interactive docs are available at `http://localhost:8000/docs` when the backend is running.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |

### Warehouses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/warehouses` | List all warehouses |
| `POST` | `/api/warehouses` | Create warehouse |
| `PUT` | `/api/warehouses/{id}` | Update warehouse |
| `DELETE` | `/api/warehouses/{id}` | Delete warehouse |

### Transfers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transfers` | List transfers (filterable by warehouse) |
| `POST` | `/api/transfers` | Create transfer |
| `PATCH` | `/api/transfers/{id}/status` | Advance transfer status |
| `PATCH` | `/api/transfers/{id}/sign` | Sign a transfer step |
| `POST` | `/api/transfers/recount` | Request recount |
| `GET` | `/api/transfer-lines` | List lines for a transfer |
| `POST` | `/api/transfer-lines` | Add line to transfer |
| `PATCH` | `/api/transfer-lines/{id}` | Update line |
| `DELETE` | `/api/transfer-lines/{id}` | Remove line |

### Inventorizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventorization` | List inventorizations |
| `POST` | `/api/inventorization` | Create inventorization |
| `PATCH` | `/api/inventorization/{id}/status` | Advance status |
| `GET` | `/api/inventorization/{id}/lines` | Get line items |
| `POST` | `/api/inventorization/{id}/lines` | Add line item |
| `POST` | `/api/inventorization/{id}/preload-lines` | Preload from warehouse inventory |
| `POST` | `/api/inventorization/recount` | Request recount |

### Receives

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/receive` | List receives |
| `POST` | `/api/receive` | Create receive |
| `PATCH` | `/api/receive/{id}/status` | Advance status |
| `GET` | `/api/receive/{id}/lines` | Get line items |
| `POST` | `/api/receive/{id}/lines` | Add line item |
| `POST` | `/api/receive/{id}/preload-lines` | Preload from inventory |
| `POST` | `/api/receive/{id}/lines/import` | Bulk import lines |
| `POST` | `/api/receive/recount` | Request recount |

### Price Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/price` | List price uploads |
| `POST` | `/api/price` | Create price upload |
| `GET` | `/api/price/{id}/lines` | Get price rows |
| `POST` | `/api/price/{id}/rows` | Add price rows |
| `POST` | `/api/price/{id}/activate` | Activate price list |
| `POST` | `/api/price/{id}/archive` | Archive price list |
| `GET` | `/api/price/active/{warehouseId}` | Get active price list for warehouse |
| `GET` | `/api/price-uploads/lookup/by-barcode` | Look up price by barcode |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/website-users` | List / create website users |
| `PATCH/DELETE` | `/api/website-users/{id}` | Update / delete website user |
| `GET/POST` | `/api/website-roles` | List / create website roles |
| `PATCH/DELETE` | `/api/website-roles/{id}` | Update / delete website role |
| `GET/POST` | `/api/pocket-users` | List / create pocket users |
| `PATCH/DELETE` | `/api/pocket-users/{id}` | Update / delete pocket user |
| `GET/POST` | `/api/pocket-roles` | List / create pocket roles |
| `PATCH/DELETE` | `/api/pocket-roles/{id}` | Update / delete pocket role |

---

## 14. Data Models

### Transfer Document (simplified)

```
Transfer
├── id
├── source_warehouse_id  (FK → warehouses)
├── dest_warehouse_id    (FK → warehouses)
├── status               (TransferStatus enum)
├── created_at
├── updated_at
├── lines[]
│   ├── id
│   ├── product_barcode
│   ├── product_name
│   ├── box_id
│   ├── sent_quantity
│   └── received_quantity
└── assignments[]
    ├── user_id          (FK → pocket_users)
    └── role             (sender | receiver)
```

### Inventorization / Receive Document (simplified)

```
Inventorization / Receive
├── id
├── warehouse_id         (FK → warehouses)
├── status               (InventorizationStatus enum)
├── created_at
├── updated_at
├── lines[]
│   ├── id
│   ├── product_barcode
│   ├── product_name
│   ├── expected_quantity
│   └── scanned_quantity
└── assignments[]
    ├── user_id          (FK → pocket_users)
    └── role             (worker)
```

### Price Upload (simplified)

```
PriceUpload
├── id
├── warehouse_id         (FK → warehouses)
├── status               (active | draft | archived)
├── created_at
└── rows[]
    ├── id
    ├── barcode
    ├── product_name
    ├── base_price
    ├── adjusted_price
    └── price_type       (markup | discounted | none)
```

---

## 15. Authentication & Security

### Token Flow

```
1. POST /api/auth/login   { email, password }
         │
         ▼
2. Backend validates password hash (bcrypt)
         │
         ▼
3. Backend returns { access_token, token_type: "bearer", user: {...} }
         │
         ▼
4. Frontend stores token in localStorage (scanmate_token)
   and user object in localStorage (scanmate_user)
         │
         ▼
5. Every subsequent request includes:
   Authorization: Bearer <token>
         │
         ▼
6. Backend decodes JWT, extracts user ID, loads user from DB
   → Proceeds if valid
   → Returns 401 if token expired or invalid
         │
         ▼
7. Frontend intercepts 401 → calls logout() → redirects to /login
```

### JWT Configuration

- **Algorithm:** HS256
- **Signing key:** `SECRET_KEY` from environment (must be a long random string in production)
- **Expiry:** `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 1440 minutes = 24 hours)
- **Subject (`sub`):** User's numeric ID as a string

### Password Handling

- Passwords are hashed with **bcrypt** on user creation.
- Plain-text passwords are never stored.
- `passlib` is used for both hashing and verification.

### localStorage Keys

| Key | Content |
|-----|---------|
| `scanmate_user` | JSON-encoded user object (role, modules, etc.) |
| `scanmate_token` | Raw JWT string |
| `scanmate_warehouse_id` | Currently selected warehouse ID |

---

## 16. UI Design System

The admin panel uses a custom dark theme with a **glass morphism** aesthetic. Design tokens are defined as CSS custom properties in `frontend/src/index.css` and used throughout Tailwind utility classes.

### Color Palette

| Token | Value | Use |
|-------|-------|-----|
| `--bg-base` | `#0a0a0f` | Page background |
| `--bg-surface` | `#12121a` | Card/panel backgrounds |
| `--bg-elevated` | `#1a1a2e` | Elevated surfaces |
| `--accent-cyan` | `#00d4ff` | Primary brand color, active states |
| `--accent-purple` | `#7c3aed` | Secondary brand color |
| `--glass-bg` | `rgba(255,255,255,0.05)` | Frosted glass backgrounds |
| `--glass-border` | `rgba(255,255,255,0.1)` | Glass borders |
| `--text-primary` | `#e2e8f0` | Primary text |
| `--text-secondary` | `#94a3b8` | Secondary/helper text |
| `--text-muted` | `#64748b` | Disabled / muted text |

### Layout Constants

| Token | Value |
|-------|-------|
| `--sidebar-width` | `240px` |
| `--header-height` | `60px` |

### Component Patterns

- **Cards:** `glass-bg` background with `glass-border` border, `rounded-xl` corner radius.
- **Buttons:** Primary uses `accent-cyan` background; secondary uses transparent with `glass-border`.
- **Modals:** Slide-in overlay on `bg-base` background with glass card body.
- **Status badges:** Small pill-shaped chips color-coded by status group.
- **Status progress bar:** Horizontal step indicator at the top of document detail pages.
- **Tables:** Minimal borders, alternating row hover states, sticky header.
- **Toasts:** `react-hot-toast` positioned top-right with dark theme.

---

## 17. Excel Import / Export

Bulk data import is supported across three modules. All Excel processing uses the **SheetJS (`xlsx`)** library on the frontend.

### Inventorization Lines Import

Expected columns:
| Column | Type | Description |
|--------|------|-------------|
| Barcode | string | Product barcode |
| Product Name | string | Human-readable product name |
| Expected Quantity | number | Quantity expected to be counted |

### Receive Lines Import

Same column structure as inventorization lines import.

### Price List Import

Expected columns:
| Column | Type | Description |
|--------|------|-------------|
| Barcode | string | Product barcode |
| Product Name | string | Human-readable product name |
| Base Price | number | Original/reference price |
| Adjusted Price | number | Marked-up or discounted price |

### Import Flow

1. User clicks the import button and selects an `.xlsx` or `.xls` file.
2. The frontend reads the file using SheetJS and parses it into a JSON array.
3. The array is sent to the backend via the relevant import endpoint.
4. The backend validates each row and inserts valid rows, returning a summary of inserted vs. failed rows.
5. On success, the React Query cache for that document's lines is invalidated and the table refreshes.

---

## 18. Build & Deployment

### Frontend Production Build

```bash
cd frontend
npm run build
# Output is written to frontend/dist/
```

The `dist/` directory is a static bundle that can be served from any static file host (Nginx, Vercel, S3 + CloudFront, etc.).

Set the `VITE_API_URL` environment variable to your production backend URL before building.

### Backend Production

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

For production, consider:
- Running behind an **Nginx** reverse proxy.
- Using **gunicorn** with uvicorn workers: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`
- Setting `APP_ENV=production` to disable debug output.
- Using PostgreSQL (not SQLite) via the `DB_*` environment variables.

### Docker (optional)

The repository does not include a `Dockerfile` by default. A minimal setup would be:

```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

## 19. Contributing & Branch Strategy

### Active Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable production-ready code |
| `sndr2` | Current active development branch (sender/receiver workflow v2, status color updates, Excel import improvements) |

### Recent Changes (sndr2)

- Updated status colors for improved visual clarity across all modules.
- Improved Create Document and Transfer Excel import modals.
- Updated status change logic from the Pocket (mobile) app side for all modules.
- Enhanced transfer workflow for the pocket (sender/receiver) flow.

### Workflow

1. Branch from `main` for new features.
2. Open a pull request into `main` when the feature is stable.
3. The `sndr2` branch merges back into `main` via pull request.

---

## License

Internal project. Not open source.
