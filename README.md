# Zira Agile Task Management

A full-stack Agile/Jira-style task tracker built from an Excel-tracker workflow. It includes role-based authentication, SQL Server persistence, DB-driven dashboards, task CRUD, comments, task history, reports, and a drag-and-drop Kanban board.

## Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, dnd-kit, Recharts, Axios
- Backend: Node.js, Express, JWT, bcrypt, multer, ExcelJS, mssql
- Database: Microsoft SQL Server with primary keys, foreign keys, constraints, and indexes

## Folder Structure

```text
frontend/
  src/components
  src/pages
  src/services
  src/context
  src/routes
  src/styles
backend/
  src/config
  src/controllers
  src/middleware
  src/routes
  src/utils
database/
  schema.sql
  seed.sql
```

## Setup

1. Create the SQL Server database and tables:

```sql
-- Run in SQL Server Management Studio or Azure Data Studio
:r database/schema.sql
:r database/seed.sql
```

If your SQL client does not support `:r`, open and run `database/schema.sql`, then open and run `database/seed.sql`.

2. Configure backend environment:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with your SQL Server credentials.

3. Configure frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

4. Install dependencies:

```bash
npm run install:all
```

5. Start the API:

```bash
npm run dev:backend
```

6. Start the frontend:

```bash
npm run dev:frontend
```

Open `http://localhost:5173`.

## Environment Files

There are separate env files because the app can run in three different modes.

| File | Purpose | Commit? |
| --- | --- | --- |
| `.env` | Local Docker Compose values for both frontend and backend | No |
| `.env.example` | Safe template for root Docker Compose env | Yes |
| `backend/.env` | Local backend dev values for `npm run dev:backend` | No |
| `backend/.env.example` | Safe backend env template | Yes |
| `frontend/.env` | Local Vite dev values for `npm run dev:frontend` | No |
| `frontend/.env.example` | Safe frontend dev env template | Yes |
| `frontend/.env.production.example` | Safe frontend Azure/production template | Yes |

For Azure, use Azure App Service application settings and Static Web App environment variables. Do not copy real Azure secrets into committed files.

## Docker Setup

Docker is used for both local development (with live reload) and production-like testing.

### 1. Configure Environment
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Fill in your database credentials and other secrets.

### 2. Run Options

#### **Option A: Local Development (Live Reload)**
Use this while coding. Changes in `src` folders will reflect immediately.
- **Command:** `docker compose -f docker-compose.dev.yml up --build`
- **Frontend:** [http://localhost:5173/login](http://localhost:5173/login)
- **Backend:** [http://localhost:5000](http://localhost:5000)

#### **Option B: Production-like Test**
Use this to test the final build with Nginx, exactly as it will run in production.
- **Command:** `docker compose up --build`
- **Frontend:** [http://localhost/login](http://localhost/login)
- **Backend:** [http://localhost:5000](http://localhost:5000)

### 3. Stop Containers
```bash
docker compose down
# OR for development
docker compose -f docker-compose.dev.yml down
```

## Import Daily Tracker Into SQL Server

There is no Excel import page in the website. Import the tracker into SQL Server from the backend command line, then the website fetches everything from the DB.

Run this after `schema.sql`, `seed.sql`, and `backend/.env` are ready:

```bash
npm --prefix backend run import:tracker -- "/Users/apple/Downloads/Daily tracker.xlsx"
```

Optional flags:

```bash
npm --prefix backend run import:tracker -- "/Users/apple/Downloads/Daily tracker.xlsx" --admin-email admin@zira.local
npm --prefix backend run import:tracker -- "/Users/apple/Downloads/Daily tracker.xlsx" --default-user-password User@12345
```

The importer maps your workbook like this:

- `Resource Name` -> employee/user
- `Project Name` / `Project Name/BU` -> project
- `Task Name` -> task title
- `Detail Description` -> description
- `Daily Update (Date Wise)` / `Remark` -> remarks
- Sheet name -> module
- `WIP` -> `In Progress`
- `Completed` / `Complete` -> `Done`
- `Hold` / `On hold` -> `Blocked`

If a resource does not exist in `Users`, the importer creates a normal user with email like `resource.name@tracker.local` and the default password `User@12345`.

After importing the daily tracker, sync the approved user list and credentials:

```bash
npm --prefix backend run sync:users
```

This makes `Pattanaik, Jayant` the only active admin, sets all approved users as normal users, remaps imported tasks to those users, and deactivates generated/non-canonical users.

## Sample Logins

- Admin: `Pattanaik, Jayant` / `Jayant@12345`
- Normal users: use their full name from the approved user list, for example `Bhise, Kuldeep` / `User@12345`

The login screen accepts either full name or email.

## Main API Routes

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Users:

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Tasks:

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `PATCH /api/tasks/:id/priority`
- `GET /api/tasks/:id/comments`
- `POST /api/tasks/:id/comments`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Reports:

- `GET /api/reports/export`

Dashboards:

- `GET /api/dashboard/admin`
- `GET /api/dashboard/user`

## Security Notes

- JWT is required for all private routes.
- Admin-only APIs use role middleware.
- Normal users only receive tasks where `assigned_user_id = req.user.user_id`.
- SQL Server calls use `mssql` parameterized queries.
- Passwords are stored as bcrypt hashes.
