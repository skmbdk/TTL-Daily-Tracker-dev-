# Azure Deployment Guide

This project can run fully in Azure with:

- Frontend: Azure Static Web Apps
- Backend: Azure App Service
- Database: Azure SQL Database

## 1. Create Azure SQL Database

1. In Azure Portal, create a SQL Database.
2. Create or select a SQL Server during setup.
3. Save these values:
   - Server name, for example `zira-sql-server.database.windows.net`
   - Database name, for example `ZiraAgile`
   - SQL admin username
   - SQL admin password
4. In SQL Server networking/firewall, allow the backend to connect:
   - For easiest setup, enable "Allow Azure services and resources to access this server".
   - For tighter production setup, use private networking or specific firewall rules.
5. Open Azure Data Studio or SSMS and run:

```sql
:r database/schema.sql
:r database/seed.sql
```

If `:r` is not supported, run `database/schema.sql` first, then `database/seed.sql`.

## 2. Deploy Backend to Azure App Service

Create a new App Service:

- Runtime stack: Node.js LTS
- OS: Linux
- Publish: Code
- Source: GitHub repo
- Root/project folder: `backend`

Use these commands/settings:

```bash
Build command: npm install
Startup command: npm start
```

Set App Service application settings:

```env
NODE_ENV=production
CLIENT_URL=https://your-static-web-app-url.azurestaticapps.net

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
PRESENTER_PASSWORD=replace_with_presenter_password

DB_USER=your_sql_admin_user
DB_PASSWORD=your_sql_admin_password
DB_SERVER=zira-sql-server.database.windows.net
DB_DATABASE=ZiraAgile
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
```

Keep these values in Azure App Service application settings. Do not put real secrets in `docker-compose.yml`, `.env.example`, or committed files. For local Docker runs, copy `.env.example` to `.env` and fill values only on your machine.

After deploy, test:

```text
https://your-backend-app.azurewebsites.net/api/health
```

Expected response:

```json
{"status":"ok","database":"connected"}
```

## 3. Deploy Frontend to Azure Static Web Apps

Create a new Static Web App:

- Source: GitHub repo
- App location: `frontend`
- Build command: `npm run build`
- Output location: `dist`
- API location: leave empty, because the backend is App Service

Set Static Web App environment variable:

```env
VITE_API_URL=https://your-backend-app.azurewebsites.net/api
VITE_DEMO_MODE=false
```

Redeploy the frontend after setting `VITE_API_URL`, because Vite embeds this value at build time.

## 4. Update CORS After Both URLs Exist

Once both services are deployed:

1. Copy the Static Web App URL.
2. Go to backend App Service settings.
3. Set:

```env
CLIENT_URL=https://your-static-web-app-url.azurestaticapps.net
```

If you also deploy previews/custom domains, add them comma-separated:

```env
CLIENT_URL=https://your-static-web-app-url.azurestaticapps.net,https://your-domain.com
```

Restart the backend App Service after changing settings.

## 5. Final Checks

Check these in order:

1. Backend health:

```text
https://your-backend-app.azurewebsites.net/api/health
```

2. Frontend loads:

```text
https://your-static-web-app-url.azurestaticapps.net
```

3. Login works.
4. Dashboard loads data.
5. Tasks and Kanban API calls work.

## Common Issues

- `CORS` error: backend `CLIENT_URL` does not match the frontend URL.
- `database: connection failed`: SQL firewall or DB credentials are wrong.
- Frontend calls localhost: `VITE_API_URL` was not set before the frontend build.
- Refreshing `/tasks` returns 404: `frontend/staticwebapp.config.json` is missing or not deployed.
