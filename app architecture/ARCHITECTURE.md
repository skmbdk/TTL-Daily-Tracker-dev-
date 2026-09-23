# Zira Agile Task Management - Architecture

Generated from the current repository layout. This map reflects the code under
`frontend/src`, `backend/src`, and `database`.

## System Graph

```mermaid
graph TD
    classDef browser fill:#172554,stroke:#60a5fa,color:#eff6ff
    classDef react fill:#0f172a,stroke:#22d3ee,color:#ecfeff
    classDef service fill:#164e63,stroke:#67e8f9,color:#ecfeff
    classDef node fill:#052e16,stroke:#34d399,color:#ecfdf5
    classDef guard fill:#451a03,stroke:#f59e0b,color:#fffbeb
    classDef db fill:#4c0519,stroke:#fb7185,color:#fff1f2
    classDef script fill:#312e81,stroke:#a5b4fc,color:#eef2ff

    Browser["Browser"]:::browser --> Main["frontend/src/main.jsx"]:::react
    Main --> Providers["ThemeProvider + AuthProvider"]:::react
    Providers --> App["App.jsx routes"]:::react
    App --> Layout["Sidebar + Navbar + page outlet"]:::react

    Layout --> Dashboards["AdminDashboard / UserDashboard"]:::react
    Layout --> Kanban["Kanban"]:::react
    Layout --> Tasks["Tasks"]:::react
    Layout --> AdminPages["Admin Users / Projects"]:::react
    App --> Login["Login"]:::react

    Dashboards --> DashboardService["dashboardService"]:::service
    Kanban --> TaskService["taskService"]:::service
    Kanban --> ProjectService["projectService"]:::service
    Kanban --> UserService["userService"]:::service
    Tasks --> TaskService
    Tasks --> ProjectService
    Tasks --> UserService
    Tasks --> ReportService["reportService"]:::service
    AdminPages --> ProjectService
    AdminPages --> UserService
    Login --> AuthService["authService"]:::service

    AuthService --> Axios["api.js Axios client + JWT interceptor"]:::service
    DashboardService --> Axios
    TaskService --> Axios
    ProjectService --> Axios
    UserService --> Axios
    ReportService --> Axios

    Axios -. "HTTP /api" .-> Express["Express server.js"]:::node
    Express --> Health["GET /api/health"]:::node
    Express --> AuthRoutes["/api/auth"]:::node
    Express --> UserRoutes["/api/users"]:::node
    Express --> TaskRoutes["/api/tasks"]:::node
    Express --> ProjectRoutes["/api/projects"]:::node
    Express --> DashboardRoutes["/api/dashboard"]:::node
    Express --> ReportRoutes["/api/reports"]:::node

    AuthRoutes --> AuthController["authController"]:::node
    UserRoutes --> Protect["protect JWT middleware"]:::guard
    TaskRoutes --> Protect
    ProjectRoutes --> Protect
    DashboardRoutes --> Protect
    ReportRoutes --> Protect
    UserRoutes --> RequireRole["requireRole"]:::guard
    ProjectRoutes --> RequireRole
    DashboardRoutes --> RequireRole
    TaskRoutes --> ReadOnlyGuard["blockReadOnlyMutations"]:::guard

    UserRoutes --> UserController["userController"]:::node
    TaskRoutes --> TaskController["taskController"]:::node
    ProjectRoutes --> ProjectController["projectController"]:::node
    DashboardRoutes --> DashboardController["dashboardController"]:::node
    ReportRoutes --> ReportController["reportController + ExcelJS"]:::node

    AuthController --> DbPool["config/db.js mssql pool"]:::node
    UserController --> DbPool
    TaskController --> DbPool
    ProjectController --> DbPool
    DashboardController --> DbPool
    ReportController --> DbPool
    Protect --> DbPool
    Health --> DbPool
    DbPool --> SqlServer[("Microsoft SQL Server")]:::db

    Scripts["syncKnownUsers / migrateLegacyRemarks / migrateToAzure"]:::script --> DbPool
```

## Frontend Routes

```mermaid
graph LR
    App["App.jsx"] --> Public["/login"]
    App --> Protected["ProtectedRoute"]
    Protected --> Shell["AuthenticatedLayout"]
    Shell --> Home["/ -> HomeRedirect"]
    Shell --> UserDashboard["/dashboard -> UserDashboard"]
    Shell --> Kanban["/kanban -> Kanban"]
    Shell --> Tasks["/tasks -> Tasks"]
    Shell --> AdminRoute["AdminRoute"]
    AdminRoute --> AdminDashboard["/admin/dashboard -> AdminDashboard"]
    AdminRoute --> Users["/admin/users -> Users"]
    AdminRoute --> Projects["/admin/projects -> Projects"]
    App --> Fallback["* -> /"]

    Reports["Reports.jsx"] -. "not mounted in App.jsx" .-> App
    Graphify["Graphify.jsx"] -. "empty and not mounted" .-> App
```

## Frontend Composition

```mermaid
graph TD
    Main["main.jsx"] --> ThemeContext["ThemeContext"]
    Main --> AuthContext["AuthContext"]
    Main --> App["App.jsx"]
    AuthContext --> AuthService["authService"]
    App --> Sidebar["Sidebar"]
    App --> Navbar["Navbar"]
    App --> ProtectedRoute["ProtectedRoute"]
    App --> AdminRoute["AdminRoute"]

    DashboardWrappers["AdminDashboard / UserDashboard"] --> DashboardView["DashboardView"]
    DashboardView --> StatCard["StatCard"]
    DashboardView --> DashboardSkeleton["DashboardSkeletonLoader"]
    DashboardView --> Recharts["Recharts charts"]
    DashboardView --> DashboardService["dashboardService"]

    Kanban["Kanban"] --> KanbanBoard["KanbanBoard"]
    KanbanBoard --> KanbanColumn["KanbanColumn"]
    KanbanColumn --> TaskCard["TaskCard"]
    Kanban --> TaskModal["TaskModal"]
    Kanban --> TaskService["taskService"]
    Kanban --> ProjectService["projectService"]
    Kanban --> UserService["userService"]

    Tasks["Tasks"] --> FilterBar["FilterBar"]
    Tasks --> DataTable["DataTable"]
    Tasks --> TaskModal
    Tasks --> ConfirmModal["ConfirmModal"]
    Tasks --> ReportService["reportService"]
    TaskModal --> TaskForm["TaskForm"]
    TaskModal --> RemarksFilter["RemarksFilter"]
    RemarksFilter --> Calendar["ui/calendar"]

    Users["Users"] --> DataTable
    Users --> ConfirmModal
    Users --> UserService
    Projects["Projects"] --> DataTable
    Projects --> ConfirmModal
    Projects --> ProjectService

    AuthService --> Api["api.js"]
    DashboardService --> Api
    TaskService --> Api
    ProjectService --> Api
    UserService --> Api
    ReportService --> Api
```

## Backend Routes

```mermaid
graph TD
    Server["server.js"] --> AuthRoutes["authRoutes"]
    Server --> UserRoutes["userRoutes"]
    Server --> TaskRoutes["taskRoutes"]
    Server --> ProjectRoutes["projectRoutes"]
    Server --> DashboardRoutes["dashboardRoutes"]
    Server --> ReportRoutes["reportRoutes"]

    AuthRoutes -->|"POST /login, /register"| AuthController["authController"]
    AuthRoutes -->|"GET /me, POST /logout"| Protect["protect"] --> AuthController

    UserRoutes --> Protect
    UserRoutes -->|"admin/presenter reads; admin writes"| RequireRole["requireRole"]
    UserRoutes --> UserController["userController"]

    TaskRoutes --> Protect
    TaskRoutes --> ReadOnly["blockReadOnlyMutations"]
    TaskRoutes -->|"CRUD, status, priority, remarks, comments"| TaskController["taskController"]

    ProjectRoutes --> Protect
    ProjectRoutes -->|"admin writes"| RequireRole
    ProjectRoutes --> ProjectController["projectController"]

    DashboardRoutes --> Protect
    DashboardRoutes -->|"admin endpoint requires admin"| RequireRole
    DashboardRoutes --> DashboardController["dashboardController"]

    ReportRoutes --> Protect
    ReportRoutes -->|"GET /export"| ReportController["reportController"]

    AuthController --> Db["getPool + mssql"]
    UserController --> Db
    TaskController --> Db
    ProjectController --> Db
    DashboardController --> Db
    ReportController --> Db
```

## Database Entities

```mermaid
erDiagram
    Roles ||--o{ Users : assigns
    Users ||--o{ Projects : creates
    Projects ||--o{ ProjectMembers : has
    Users ||--o{ ProjectMembers : joins
    Projects ||--o{ Tasks : groups
    Users ||--o{ Tasks : assigned_to
    Users ||--o{ Tasks : creates
    Tasks ||--o{ TaskComments : has
    Users ||--o{ TaskComments : writes
    Tasks ||--o{ TaskRemarks : has
    Users ||--o{ TaskRemarks : writes
    Tasks ||--o{ TaskHistory : records
    Users ||--o{ TaskHistory : changes
    Users ||--o{ ExcelImports : imports

    Roles {
        int role_id PK
        nvarchar role_name
    }
    Users {
        int user_id PK
        nvarchar full_name
        nvarchar email
        int role_id FK
        nvarchar status
    }
    Projects {
        int project_id PK
        nvarchar project_name
        int created_by FK
        nvarchar status
    }
    ProjectMembers {
        int project_member_id PK
        int project_id FK
        int user_id FK
    }
    Tasks {
        int task_id PK
        nvarchar task_title
        int assigned_user_id FK
        int project_id FK
        int created_by FK
        nvarchar status
        nvarchar priority
    }
    TaskComments {
        int comment_id PK
        int task_id FK
        int user_id FK
    }
    TaskRemarks {
        int remark_id PK
        int task_id FK
        int user_id FK
        date remark_date
    }
    TaskHistory {
        int history_id PK
        int task_id FK
        int changed_by FK
    }
    ExcelImports {
        int import_id PK
        int imported_by FK
    }
```

## Notes

- Authentication is JWT based. `api.js` attaches the saved token to requests, and
  backend `protect` reloads the active user from SQL Server.
- Presenter mode is represented in the auth context and JWT/session handling as a
  read-only mode; it blocks non-GET task mutations through `blockReadOnlyMutations`.
- `Reports.jsx` exists and can export Excel through `reportService`, but it is not
  currently mounted in `App.jsx`.
- `Graphify.jsx` exists as an empty page file and is not currently mounted.
- `database/schema.sql` defines `admin` and `user` role names; presenter behavior
  is handled in application/session logic rather than as a schema role.
