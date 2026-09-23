# Graph Report - zira 2.0  (2026-05-12)

## Corpus Check
- 83 files · ~42,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 608 nodes · 975 edges · 65 communities (33 shown, 32 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9650eaf2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend Controllers|Backend Controllers]]
- [[_COMMUNITY_Skeleton Loaders|Skeleton Loaders]]
- [[_COMMUNITY_App Router & Auth|App Router & Auth]]
- [[_COMMUNITY_Navigation Shell|Navigation Shell]]
- [[_COMMUNITY_Dashboard Components|Dashboard Components]]
- [[_COMMUNITY_UI Primitives|UI Primitives]]
- [[_COMMUNITY_Task Controller & Routes|Task Controller & Routes]]
- [[_COMMUNITY_Task Operations|Task Operations]]
- [[_COMMUNITY_User Sync Script|User Sync Script]]
- [[_COMMUNITY_Azure Migration Scripts|Azure Migration Scripts]]
- [[_COMMUNITY_Kanban Board|Kanban Board]]
- [[_COMMUNITY_Task Form & Filters|Task Form & Filters]]
- [[_COMMUNITY_API Routes & Auth Middleware|API Routes & Auth Middleware]]
- [[_COMMUNITY_Project Concepts|Project Concepts]]
- [[_COMMUNITY_Report Builder Functions|Report Builder Functions]]
- [[_COMMUNITY_Dashboard Data Aggregation|Dashboard Data Aggregation]]
- [[_COMMUNITY_Auth Context Methods|Auth Context Methods]]
- [[_COMMUNITY_Session Management|Session Management]]
- [[_COMMUNITY_Task Modal Handlers|Task Modal Handlers]]
- [[_COMMUNITY_Frontend Build Config|Frontend Build Config]]
- [[_COMMUNITY_Soft Delete Pattern|Soft Delete Pattern]]
- [[_COMMUNITY_Dashboard Skeleton|Dashboard Skeleton]]
- [[_COMMUNITY_Drag & Drop Handlers|Drag & Drop Handlers]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Graphify Page|Graphify Page]]
- [[_COMMUNITY_Seed Data|Seed Data]]
- [[_COMMUNITY_Database Schema|Database Schema]]
- [[_COMMUNITY_Database Configuration|Database Configuration]]
- [[_COMMUNITY_Vite Build Config|Vite Build Config]]
- [[_COMMUNITY_Root HTML|Root HTML]]
- [[_COMMUNITY_Register Endpoint|Register Endpoint]]
- [[_COMMUNITY_GetUserById Endpoint|GetUserById Endpoint]]
- [[_COMMUNITY_CreateUser Endpoint|CreateUser Endpoint]]
- [[_COMMUNITY_UpdateUser Endpoint|UpdateUser Endpoint]]
- [[_COMMUNITY_GetProjects Endpoint|GetProjects Endpoint]]
- [[_COMMUNITY_CreateProject Endpoint|CreateProject Endpoint]]
- [[_COMMUNITY_UpdateProject Endpoint|UpdateProject Endpoint]]
- [[_COMMUNITY_Active Users Endpoint|Active Users Endpoint]]
- [[_COMMUNITY_SyncKnownUsers Script|SyncKnownUsers Script]]
- [[_COMMUNITY_Migration Legacy Remarks|Migration Legacy Remarks]]
- [[_COMMUNITY_MigrateToAzure Script|MigrateToAzure Script]]
- [[_COMMUNITY_AuthProvider Component|AuthProvider Component]]
- [[_COMMUNITY_ThemeProvider Component|ThemeProvider Component]]
- [[_COMMUNITY_FormSkeletonLoader|FormSkeletonLoader]]
- [[_COMMUNITY_Skeleton Component|Skeleton Component]]
- [[_COMMUNITY_ScrollProgressBar|ScrollProgressBar]]
- [[_COMMUNITY_ConfirmModal|ConfirmModal]]
- [[_COMMUNITY_formatDate Utility|formatDate Utility]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 32 edges
2. `Dashboard View` - 27 edges
3. `getPool()` - 24 edges
4. `useAuth()` - 23 edges
5. `Tasks Table` - 14 edges
6. `Axios API Client` - 14 edges
7. `Users Table` - 12 edges
8. `findAuthorizedTask - check task access permissions` - 12 edges
9. `Root Router` - 12 edges
10. `protect()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Page` --references--> `Zira Agile Task Management`  [INFERRED]
  frontend/src/pages/Graphify.jsx → README.md
- `Zira Agile Task Management` --references--> `JWT Authentication`  [EXTRACTED]
  README.md → frontend/src/services/api.js
- `generateToken JWT Creator` --conceptually_related_to--> `Users Table`  [INFERRED]
  backend/src/utils/generateToken.js → database/schema.sql
- `Tasks Table` --references--> `Role-Based Access Control`  [INFERRED]
  database/schema.sql → frontend/src/App.jsx
- `login - authenticate user` --semantically_similar_to--> `protect - JWT authentication middleware`  [INFERRED] [semantically similar]
  backend/src/controllers/authController.js → backend/src/middleware/authMiddleware.js

## Hyperedges (group relationships)
- **Task Audit Trail System** — task_history, task_comments, task_remarks [EXTRACTED 1.00]
- **Express Security and Rate-Limiting Stack** — helmet, cors, express_rate_limit [EXTRACTED 1.00]
- **Project Membership Model** — project_members, users, projects [EXTRACTED 1.00]
- **Task Management Flow** — taskcontroller_gettasks, taskcontroller_gettaskbyid, taskcontroller_createtask, taskcontroller_updatetask, taskcontroller_deletetask, taskcontroller_updatetaskstatus, taskcontroller_updatetaskpriority, taskcontroller_getcomments, taskcontroller_addcomment, taskcontroller_gettaskremarks, taskcontroller_addtaskremark, taskcontroller_updatetaskremark, taskcontroller_deletetaskremark, taskcontroller_findauthorizedtask, taskcontroller_recordhistory, taskcontroller_ensuretaskremarkstable [EXTRACTED 1.00]
- **Authentication and Session System** — authcontroller_login, authcontroller_register, authcontroller_me, authcontroller_heartbeat, authcontroller_logout, authmiddleware_protect, readonlymiddleware_blockreadonlymutations [EXTRACTED 1.00]
- **Excel Export and Report Pipeline** — reportcontroller_exporttasks, reportcontroller_buildreportwhere [EXTRACTED 1.00]
- **Theme Context Integration** — themecontext_themeprovider, themecontext_usetheme, sidebar_sidebar, navbar_navbar, skeletonloader_tableskeletonloader, skeletonloader_statcardskeletonloader, skeletonloader_chartskeletonloader, skeletonloader_kanbancolumnskeletonloader [EXTRACTED 1.00]
- **Auth-enabled Navigation Shell** — sidebar_sidebar, navbar_navbar, mobilenav_mobilenav, authcontext_authprovider, authcontext_useauth [EXTRACTED 1.00]
- **Kanban Drag-and-Drop Board** — kanbanboard_kanbanboard, kanbanboard_kanban_statuses, kanbancolumn_kanbancolumn, taskcard_taskcard, taskcard_taskcardpreview, kanbanboard_handledragstart, kanbanboard_handledragend [EXTRACTED 1.00]
- **Frontend Application Composition** — app, authenticatedlayout, homeredirect, protectedroute, adminroute [EXTRACTED 0.85]
- **Dashboard Analytics Charts** — status_flow_chart, priority_split_chart, delivery_risk_matrix, workload_by_priority, completion_trend, completion_funnel, module_status_heatmap, recent_activity_feed [EXTRACTED 0.85]
- **Service Layer** — api, authservice, taskservice, userservice, projectservice, dashboardservice, reportservice [EXTRACTED 0.85]

## Communities (65 total, 32 thin omitted)

### Community 0 - "Backend Controllers"
Cohesion: 0.05
Nodes (55): Async Handler Middleware, connectWithRetry(), dbConfig, getPool(), isTransientConnectionError(), wait(), heartbeat, login (+47 more)

### Community 1 - "Skeleton Loaders"
Cohesion: 0.07
Nodes (58): Admin Dashboard, Admin Route Guard, Axios API Client, Root Router, Auth Context, Authenticated Layout, Auth Service, Completion Funnel (+50 more)

### Community 2 - "App Router & Auth"
Cohesion: 0.08
Nodes (19): cn(), avatarGradients, DashboardView(), formatCompactNumber(), getRiskBubbleTone(), heatmapStatuses, priorityOrder, RiskBubbleShape() (+11 more)

### Community 3 - "Navigation Shell"
Cohesion: 0.09
Nodes (24): addComment, addTaskRemark, buildTaskWhere(), createTask, deleteTask, deleteTaskRemark, findAuthorizedTask(), findTaskById() (+16 more)

### Community 4 - "Dashboard Components"
Cohesion: 0.08
Nodes (33): useAuth, Avatar, AvatarBadge, AvatarGroup, AvatarGroupCount, AvatarImage, AvatarFallback, Calendar (+25 more)

### Community 5 - "UI Primitives"
Cohesion: 0.12
Nodes (15): KanbanBoardSkeletonLoader(), TaskModal(), todayInputDate(), Kanban(), Login(), initialFilters, Reports(), initialFilters (+7 more)

### Community 6 - "Task Controller & Routes"
Cohesion: 0.08
Nodes (19): getNotifications, getUnreadCount, markAllRead, markRead, router, aliases, canonicalIds, canonicalNames (+11 more)

### Community 7 - "Task Operations"
Cohesion: 0.08
Nodes (27): 1. Configure Environment, 2. Run Options, 3. Stop Containers, code:text (frontend/), code:bash (npm --prefix backend run import:tracker -- "/Users/apple/Dow), code:bash (npm --prefix backend run import:tracker -- "/Users/apple/Dow), code:bash (npm --prefix backend run sync:users), code:sql (-- Run in SQL Server Management Studio or Azure Data Studio) (+19 more)

### Community 8 - "User Sync Script"
Cohesion: 0.13
Nodes (12): MobileNav(), labelMotion, Sidebar(), sidebarTransition, DashboardSkeletonLoader(), useAuth(), Tasks(), UserDashboard() (+4 more)

### Community 9 - "Azure Migration Scripts"
Cohesion: 0.16
Nodes (13): KANBAN_STATUSES, KanbanColumn(), avatarGradients, formatDate(), getAvatarGradient(), getCardClassName(), getInitials(), priorityClass (+5 more)

### Community 10 - "Kanban Board"
Cohesion: 0.13
Nodes (6): Navbar(), AuthProvider(), ThemeContext, ThemeProvider(), NotificationBell(), notificationService

### Community 11 - "Task Form & Filters"
Cohesion: 0.11
Nodes (17): 1. Create Azure SQL Database, 2. Deploy Backend to Azure App Service, 3. Deploy Frontend to Azure Static Web Apps, 4. Update CORS After Both URLs Exist, 5. Final Checks, Azure Deployment Guide, code:sql (:r database/schema.sql), code:text (https://your-static-web-app-url.azurestaticapps.net) (+9 more)

### Community 12 - "API Routes & Auth Middleware"
Cohesion: 0.21
Nodes (18): addComment - add task comment, addTaskRemark - add daily remark, createTask - create new task, deleteTask - delete task, deleteTaskRemark - delete daily remark, ensureTaskRemarksTable - create TaskRemarks table if not exists, fetchTaskRemarkById - fetch single remark by ID, fetchTaskRemarks - retrieve daily remarks for task (+10 more)

### Community 13 - "Project Concepts"
Cohesion: 0.18
Nodes (10): DataTable(), ChartSkeletonLoader(), KanbanColumnSkeletonLoader(), StatCardSkeletonLoader(), TableSkeletonLoader(), useTheme(), PriorityBadge(), SmartDueDate() (+2 more)

### Community 14 - "Report Builder Functions"
Cohesion: 0.22
Nodes (12): buildConfig(), chunkRows(), ensureTargetConfig(), fullTableName(), getTableCount(), insertRows(), main(), quote() (+4 more)

### Community 15 - "Dashboard Data Aggregation"
Cohesion: 0.15
Nodes (4): avatarGradients, emptyUser, getUserInitials(), UserIdentityCell()

### Community 16 - "Auth Context Methods"
Cohesion: 0.16
Nodes (7): emptyProject, formatDate(), getProjectInitials(), ProjectDateChip(), ProjectNameCell(), Projects(), ProjectStatusBadge()

### Community 17 - "Session Management"
Cohesion: 0.15
Nodes (12): Backend Routes, code:mermaid (graph TD), code:mermaid (graph LR), code:mermaid (graph TD), code:mermaid (graph TD), code:mermaid (erDiagram), Database Entities, Frontend Composition (+4 more)

### Community 18 - "Task Modal Handlers"
Cohesion: 0.33
Nodes (5): emptyTask, TASK_LOCATIONS, TASK_MODULES, TASK_PRIORITIES, TASK_STATUSES

### Community 19 - "Frontend Build Config"
Cohesion: 0.36
Nodes (5): AuthContext, authService, connectSocket(), disconnectSocket(), resolveSocketUrl()

### Community 20 - "Soft Delete Pattern"
Cohesion: 0.28
Nodes (9): login - authenticate user, protect - JWT authentication middleware, Dashboard API Routes, Project API Routes, blockReadOnlyMutations - presenter mode guard, Report API Routes, requireRole - role-based access middleware, Task API Routes (+1 more)

### Community 21 - "Dashboard Skeleton"
Cohesion: 0.52
Nodes (5): clampProgress(), findScrollableTarget(), getDocumentProgress(), getElementProgress(), getScrollProgress()

### Community 22 - "Drag & Drop Handlers"
Cohesion: 0.4
Nodes (6): Azure Deployment, Excel Import Workflow, Graphify Page, JWT Authentication, SQL Server Integration, Zira Agile Task Management

### Community 24 - "Tailwind Config"
Cohesion: 0.5
Nodes (4): buildReportWhere - build WHERE clause for report filtering, exportTasks - export tasks to Excel with summary sheets, buildTaskWhere - build WHERE clause for task filtering, getTasks - retrieve filtered task list

### Community 25 - "Vite Config"
Cohesion: 0.5
Nodes (4): buildDashboardData - aggregate task metrics and analytics, getAdminDashboard - get admin dashboard data, getUserDashboard - get user-scoped dashboard data, runScopedQuery - execute dashboard query with scope replacement

### Community 26 - "PostCSS Config"
Cohesion: 0.5
Nodes (4): clearSession, login, logout, syncMe

### Community 27 - "Graphify Page"
Cohesion: 0.67
Nodes (3): getActiveUsers Deduplication, markActive Session Tracker, markInactive Session Cleanup

### Community 28 - "Seed Data"
Cohesion: 0.67
Nodes (3): addComment, handleSubmit, submitRemark

## Knowledge Gaps
- **168 isolated node(s):** `AuthContext`, `ThemeContext`, `emptyTask`, `sidebarTransition`, `labelMotion` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `Project Concepts` to `App Router & Auth`, `UI Primitives`, `User Sync Script`, `Azure Migration Scripts`, `Kanban Board`, `Auth Context Methods`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `getPool()` connect `Backend Controllers` to `Navigation Shell`, `Task Controller & Routes`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `User Sync Script` to `Kanban Board`, `Frontend Build Config`, `UI Primitives`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `AuthContext`, `ThemeContext`, `emptyTask` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Controllers` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Skeleton Loaders` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `App Router & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._