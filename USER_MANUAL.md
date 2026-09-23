# 📘 TTL Tracker - Comprehensive System User Manual & Feature Guide

Welcome to the **TTL Tracker** (Task & Team Lifecycle Tracker) User Manual. This guide provides a complete, step-by-step walkthrough of all UI features, workflows, and permissions across all three user roles: **Normal User (Member)**, **Presenter (Manager)**, and **Administrator (Admin)**.

---

## 📌 Table of Contents
1. [User Roles & Permission Matrix](#1-user-roles--permission-matrix)
2. [Role 1: Normal User / Member Guide](#2-role-1-normal-user--member-guide)
3. [Role 2: Presenter / Manager Guide](#3-role-2-presenter--manager-guide)
4. [Role 3: Administrator (Admin) Guide](#4-role-3-administrator-admin-guide)
5. [UI Features & Navigation Reference](#5-ui-features--navigation-reference)
6. [Exporting Reports & Data Guidance](#6-exporting-reports--data-guidance)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 👥 1. User Roles & Permission Matrix

| Feature / Capability | Normal User (Member) | Presenter (Manager) | Administrator (Admin) |
|---|:---:|:---:|:---:|
| **View Dashboard & Personal KPIs** | ✅ Assigned Only | ✅ Full View | ✅ Full View |
| **Kanban Board Drag & Drop** | ✅ Assigned Tasks | ✅ All Tasks | ✅ All Tasks |
| **Add Daily Remarks & Work Logs** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Upload File & Link Attachments** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create & Edit Tasks** | 🟡 Assigned Tasks | ✅ All Tasks | ✅ All Tasks |
| **View Project Health & Metrics** | ✅ Read-only | ✅ Full Access | ✅ Full Access |
| **Create & Edit Projects** | ❌ Restricted | 🟡 View / Request | ✅ Full Control |
| **User Workload & Performance Modal** | 🟡 Self Only | ✅ All Members | ✅ All Members |
| **User Onboarding & Role Changes** | ❌ Restricted | ❌ Restricted | ✅ Full Control |
| **Activity Center & Audit Logging** | ❌ Restricted | 🟡 View Logs | ✅ Full Control |
| **Export Reports to CSV** | ❌ Restricted | ✅ Yes | ✅ Yes |

---

## 👤 2. Role 1: Normal User / Member Guide

### 🎯 Primary Objective
As a **Normal User (Member)**, your main focus is completing daily assigned tasks, tracking your personal workload, updating task states on the Kanban board, and adding progress remarks or attachments.

---

### 📍 Key Features & Step-by-Step Instructions

#### Feature A: Managing Tasks on the Kanban Board
1. **Access Kanban Board**: Click **Kanban** in the left sidebar menu.
2. **Understand Kanban Columns**:
   - `To Do`: Tasks assigned to you that are ready to begin.
   - `In Progress`: Tasks you are actively working on today.
   - `Testing / Review`: Tasks completed and undergoing quality verification.
   - `Completed`: Delivered and closed tasks.
3. **Move Tasks (Drag & Drop)**: Click and hold any task card, then drag it horizontally to another column (e.g. move from `To Do` to `In Progress`). The system updates the state in real-time.

#### Feature B: Adding Daily Remarks & Progress Logs
1. Click on any task card on the Kanban Board or Task List to open the **Task Details Modal**.
2. Scroll down to the **Daily Remarks** section.
3. Type your progress note in the text box (e.g., *"Completed database schema design and verified endpoint validation"*).
4. Click **Add Remark**. All team members and managers can view this chronological log.

#### Feature C: Attaching Files and External Links
1. Inside the **Task Details Modal**, navigate to **Task Attachments**.
2. **Upload File**: Click **Upload File**, select your document (PDF, PNG, JPG, ZIP, DOCX), and confirm upload.
3. **Add Web Link**: Click **Add Link**, enter the URL (e.g., GitHub Pull Request or Figma design link) along with a descriptive title, then click Save.

---

### 💡 Practical Step-by-Step Example for Normal User
> **Scenario**: Rahul (Software Engineer) begins work on Task `#34: Installation of TC Foundation`.
> 1. **Step 1**: Rahul opens **Kanban Board** and drags Task `#34` card from `To Do` into `In Progress`.
> 2. **Step 2**: Rahul clicks on Task `#34` card to open the Details Modal.
> 3. **Step 3**: Under **Daily Remarks**, Rahul types: *"Configured server environment and installed prerequisite packages on 10.0.1.5"*, then clicks **Add Remark**.
> 4. **Step 4**: Under **Task Attachments**, Rahul clicks **Upload File** and attaches `deployment_log_v1.txt`.
> 5. **Step 5**: Once verification passes, Rahul drags Task `#34` to `Completed`.

---

## 📊 3. Role 2: Presenter / Manager Guide

### 🎯 Primary Objective
As a **Presenter / Manager**, your primary focus is presenting project metrics to stakeholders, monitoring project health, managing team workload balance, and identifying delivery bottlenecks.

---

### 📍 Key Features & Step-by-Step Instructions

#### Feature A: Presenting Project Health & Task Breakdown
1. **Navigate to Projects**: Click **Projects** in the left sidebar menu.
2. **Review Health Badges**:
   - 🟢 `On Track`: Project running smoothly; target deadline is **more than 5 days away**.
   - 🟡 `Due Soon`: Target deadline is **within 5 days**.
   - 🔴 `Overdue`: Target deadline has passed without completion.
   - 🔵 `Completed`: Space delivered.
   - 🟡 `On Hold`: Project temporarily paused.
3. **Launch Project Detail Modal**: Click **View Details** (or click anywhere on the project row) to launch the **Project Detail & Task Breakdown Modal**.
   - Displays real-time completion %, total story points delivered, assigned team members with avatars, and full task breakdown list.
   - Perfect for live client or leadership presentations.

#### Feature B: Reviewing Team Workload & Performance
1. Navigate to **Users** page in the left menu.
2. Locate the team member card and click **View Workload & Performance**.
3. Inspect key indicators:
   - **Total Assigned Tasks**: Active vs Completed.
   - **Completion Rate %**: Percentage of delivered work.
   - **Story Points Delivered**: Points completed vs total.
   - **Overdue Tasks Count**: Tasks exceeding target dates.

#### Feature C: One-Click CSV Export for Executive Reporting
1. On the **Projects** or **Users** page, click the **Export CSV** button located in the top action header.
2. An instant `.csv` report will download to your computer, pre-formatted for Microsoft Excel, Google Sheets, or PowerBI dashboards.

---

### 💡 Practical Step-by-Step Example for Presenter / Manager
> **Scenario**: Priya (Engineering Manager) conducts the Weekly Project Review meeting with directors.
> 1. **Step 1**: Priya opens **Projects** and filters status by `Active`.
> 2. **Step 2**: She identifies a project with a 🟡 `Due Soon` health badge and clicks **View Details**.
> 3. **Step 3**: During the screen-share presentation, she reviews the completion percentage (85%) and assigned team members.
> 4. **Step 4**: She clicks **Export CSV** to download the official snapshot report to email to executive leadership.

---

## 🛠️ 4. Role 3: Administrator (Admin) Guide

### 🎯 Primary Objective
As an **Administrator (Admin)**, you possess full administrative governance across the entire platform: user creation and role assignments, project creation, workspace archival, and security audit log tracking.

---

### 📍 Key Features & Step-by-Step Instructions

#### Feature A: Creating and Managing Project Spaces
1. Navigate to **Projects** page.
2. Click **Create Project** in the top action header.
3. Fill in the project creation form:
   - **Project Name**: Name of the initiative.
   - **Status**: Active, On Hold, or Completed.
   - **Start & End Target Dates**: Selected via calendar picker.
   - **Description**: Detailed space objectives.
   - **Assigned Members**: Select team members assigned to this project space.
4. Click **Save Project**.

#### Feature B: User Onboarding, Status & Role Governance
1. Navigate to **Users** page.
2. **Onboard New User**: Click **Create User**, enter Full Name, Email, System Role (`Admin`, `Manager/Presenter`, `User`), and temporary password.
3. **Modify User Role / Status**: Click **Edit** on any user row to update their role or toggle account status (`Active` vs `Inactive`).

#### Feature C: Security Audit Center & Activity Tracking
1. Click **Activity Center** in the left sidebar menu.
2. **Filter Security Logs**:
   - **Search**: Search by user name or action query.
   - **User Filter**: Inspect logs generated by a specific user.
   - **Action Type Filter**: Filter by `Task Creation`, `Project Modification`, `User Role Change`, `Login`.
   - **Date Range**: Filter by Today, Last 7 Days, Last 30 Days, or Custom Date Pickers.
3. Click any log entry row to open the **Activity Detail Modal** displaying full timestamp, IP address, and payload JSON parameters.

---

### 💡 Practical Step-by-Step Example for Administrator
> **Scenario**: Amit (System Admin) onboards a new Senior Manager and initializes a new Project Space.
> 1. **Step 1**: Amit opens **Users** -> clicks **Create User** -> inputs Name: "Ananya Sharma", Role: "Manager", Status: "Active".
> 2. **Step 2**: Amit opens **Projects** -> clicks **Create Project** -> creates "Cloud Infrastructure 2026", assigns Ananya as Lead along with 4 engineers.
> 3. **Step 3**: Amit opens **Activity Center** to verify the audit log cleanly records `User Created` and `Project Created` events with complete timestamps.

---

## 🔍 5. UI Features & Navigation Reference

### 🎨 Global Theme Controls
- **Light & Dark Theme Switcher**: Click the Sun/Moon toggle icon in the top navigation header to seamlessly switch between **Light Theme** and **Dark Theme**.
- **Human-centric Clean Aesthetics**: Soft slate badges, high-contrast typography, and smooth micro-animations.

### 🔎 Search & Filter Bar Capabilities
- **Live Search**: Instant keyword search by title, description, name, or email.
- **Dropdown Filters**: Filter by Status, Progress Range, Stream, Priority, or Team Member.
- **One-Click Filter Reset**: Click **Reset Filters (N)** to instantly return to default views.

---

## 📈 6. Exporting Reports & Data Guidance

### 📄 How CSV Export Works
1. Navigate to **Projects** or **Users** page.
2. Apply any desired search filters (optional).
3. Click **Export CSV**.
4. The system generates a clean `.csv` file with column headers:
   - **Projects Export**: `Project ID`, `Project Name`, `Status`, `Health`, `Total Tasks`, `Completed Tasks`, `Completion %`, `Start Date`, `End Date`, `Description`.
   - **Users Export**: `User ID`, `Full Name`, `Email`, `Role`, `Status`, `Total Tasks`, `Completed Tasks`, `Overdue Tasks`, `Completion %`.

---

## ❓ 7. Frequently Asked Questions (FAQ)

#### Q1: What does "Health: On Track" mean?
> **Answer**: `On Track` (Green badge) indicates the project is progressing smoothly and its target completion deadline (`end_date`) is **more than 5 days away**.

#### Q2: How do I change my assigned task status?
> **Answer**: Open the **Kanban Board** and drag your task card into `In Progress`, `Testing`, or `Completed`. Alternatively, open the Task Details modal and update the status dropdown.

#### Q3: Why can't a Normal User access the Activity Center?
> **Answer**: The Activity Center contains confidential audit logs (including login events, security logs, and role modifications) reserved strictly for Administrators and Managers for governance and compliance.

---

*End of User Manual.*
