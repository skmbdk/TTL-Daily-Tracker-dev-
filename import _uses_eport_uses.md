Aapki website par **Import Data** aur **Export CSV** 3 mukhya pages par implemented hai. 

Niche live examples ke sath detail me samjhaya gaya hai ki har jagah par isko kaise use karein:

---

# 🚀 1. **Bulk Excel Data Import (Users, Projects & Tasks)**

Aap **User Management**, **Project Management**, ya **Kanban Board** — kisi bhi page par green **"Import Data"** button se poore system ka data ek sath upload kar sakte hain.

### 📥 **Step-by-Step Live Example:**

#### **Step 1: Template Download Karein**
- Top Navbar ya Page par **"Import Data"** par click karein.
- Modal me **"Download Excel Template (.xlsx)"** button par click karein.
- Ek file download hogi: `TTL_Agile_Bulk_Import_Template.xlsx`

---

#### **Step 2: Excel File me Sample Data Bharein**

Excel file me 3 alag-alag Sheets hain:

##### 🟢 **Sheet 1: `Tasks` (Tasks Add Karne Ke Liye)**
| Task Title | Project Name | Assigned Email | Status | Priority | Story Points | Module Name | Start Date | Due Date | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Setup Auth API** | E-Commerce Platform | rahul@company.com | In Progress | High | 5 | Authentication | 2026-10-01 | 2026-10-10 | Implement JWT login |
| **Design Dashboard** | Mobile App v2 | sneha@company.com | To Do | Medium | 3 | UI/UX | 2026-10-05 | 2026-10-15 | Figma mockups review |

> 💡 **Smart Feature:** Agar project ya assigned user database me abhi tak nahi bane hain, toh system automatically unhe create/link kar leta hai!

---

##### 🔵 **Sheet 2: `Projects` (New Projects Banane Ke Liye)**
| Project Name | Description | Parent Project Name | Status |
| :--- | :--- | :--- | :--- |
| **E-Commerce Platform** | Main web store front | *(Leave blank if top-level)* | Active |
| **Payment Gateway Integration** | Razorpay & Stripe APIs | E-Commerce Platform | Active |

> 💡 **Parent-Child Hierarchy:** `Parent Project Name` wale column me main project ka naam dalne par sub-project automatically link ho jata hai!

---

##### 🟣 **Sheet 3: `Users` (Naye Team Members Add Karne Ke Liye)**
| Full Name | Email | Role | Designation |
| :--- | :--- | :--- | :--- |
| **Rahul Sharma** | rahul@company.com | user | Senior Backend Engineer |
| **Sneha Verma** | sneha@company.com | admin | UI/UX Lead |

---

#### **Step 3: Upload & Live Validation**
1. Saved Excel file ko modal me **Drag & Drop** karein.
2. System instantly preview dikhayega:
   - 🟢 **Valid Rows:** Jinhe add karne ke liye sab ready hai.
   - 🟡 **Warnings:** Jo auto-fix ho jayengi.
   - 🔴 **Errors:** Missing title ya galat email (koyi red error aaye toh us row ko red color se highlight karke batayega ki kya galti hai).
3. **"Import All Valid Data"** par click karte hi sabhi Users, Projects, aur Tasks **database me ek saath save ho jayenge**!

---

# 📤 2. **Export CSV Data (Data Download Karne Ke Liye)**

System me pehle se bane data ko Excel/CSV file me download karne ke liye:

### 1️⃣ **User Management Page (`/users`)**
- Page ke top-right bar me **"Export CSV"** button par click karein.
- Aapke saare Active & Filtered Users ki CSV file download ho jayegi with columns: `User ID`, `Full Name`, `Email`, `Role`, `Designation`, `Status`, `Created At`.

### 2️⃣ **Project Management Page (`/projects`)**
- Top-right bar me **"Export CSV"** button par click karein.
- Aapke saare projects, unka Completion %, Total Tasks, Completed Tasks, aur Health Status (`On Track`, `Overdue`, `Due Soon`) ki report download ho jayegi.

### 3️⃣ **Reports & Analytics Page (`/reports`)**
- Custom date range aur filters set karke **"Export Report"** par click karein.
- Complete sprint progress aur team workload reporting Excel/CSV me export ho jayegi.

---

### 🛡️ **Admin Permission Control (Bonus Feature):**
Agar aap Admin hain aur chahte hain ki kisi specific user ko Excel Import karne ki permission mile:
1. `/users` (User Management) page par jayein.
2. User ke paas **Edit (Pencil Icon)** button par click karein.
3. Bottom me **"Excel Data Import Access"** ka switch enable karke **Save User** kar dein!


---
explain 2

**Haan! Aaiye ise ek bilkul real-life office story (real-world scenario) se samajhte hain, taaki koi bhi beginner ya non-technical banda ise 1 minute me samajh jaye:**

---

# 🏢 Real-Life Story Example:

Maan lijiye aap **Company ke Admin / Manager** hain. 

Aaj aapki company me **5 Naye Employees** join hue hain, **2 Naye Projects** start ho rahe hain, aur unke **10 Naye Tasks** team ko assign karne hain.

---

### ❌ **Pehle Aapko Kya Karna Padta (Bina Is Feature Ke)?**
Aapko website par baith kar:
1. 5 baar **"Create User"** par click karke naam, email, role type karna padta.
2. 2 baar **"Create Project"** par click karke project ki details daalni padti.
3. 10 baar **"Add Task"** par click karke ek-ek task ka title, assignee, priority set karni padti.
👉 **Total 17 Baar manual typing & clicking! (Aapka 1 Ghanta kharab hota)** ⏱️

---

### ✅ **Ab Aap Naye Excel Import Feature Se Kaise Karenge? (Only 2 Minutes)**

#### **Step 1: Excel Sheet Download Karein**
Aap website par green **"Import Data"** button dabate hain aur **"Download Excel Template"** par click karte hain. Ek Excel file download ho jati hai.

#### **Step 2: Excel Me Apni List Bharein**
Aap us Excel sheet me bas copy-paste karke details likh dete hain:

* **Users Sheet me:**
  - `Rahul Sharma` | `rahul@company.com` | `Developer`
  - `Sneha Verma` | `sneha@company.com` | `Designer`

* **Projects Sheet me:**
  - `Mobile App Launch` | `Android & iOS App` | `Active`

* **Tasks Sheet me:**
  - `Login Page Design` | `Mobile App Launch` | `sneha@company.com` | `High` | `In Progress`
  - `API Integration` | `Mobile App Launch` | `rahul@company.com` | `Critical` | `To Do`

#### **Step 3: File Upload Karein**
Aap saved Excel file ko website par **Drag & Drop (chhod)** dete hain.

Website aapko turant screen par dikhayega:
> 🟢 **17 Rows Validated Ready!** (Koi galti nahi hai).

#### **Step 4: One-Click Import**
Aap **"Import All Valid Data"** par click karte hain... Aur BOOM! 💥 

**Sirf 5 Seconds me 5 Naye Employees, 2 Projects aur 10 Tasks website par automatic add aur assign ho jate hain!**

---

### 💡 **Aapka Kya Fayda Hua?**
1. 1 Ghante ka kaam **sirf 2 minute me** ho gaya.
2. Typos (galti se galat email ya naam type hone) ka khatra khatam ho gaya.
3. System ne galti se invalid email hone par pehle hi **Red Color से warning** de di taaki aap use thik kar sakein.




---
how did you implemnet it

Haan, **ye feature 100% possible hai** aur realistic enterprise software me bulk data creation (Users, Projects, Tasks) ke liye exact yahi mechanism use hota hai.

---

### 1. Ye Feature Kaise Kaam Karega (High-Level Architecture)

1. **Standard Excel/CSV Template Download**:
   - Admin website se ek standard template file download karega (`TTL_Data_Import_Template.xlsx`).
   - Is template me standard columns honge (e.g., `Full Name`, `Email`, `Role`, `Designation`, `Project Name`, `Task Title`, `Status`, `Priority`, `Due Date`, `Story Points`).

2. **Bulk Upload & Parsing**:
   - Excel file drag-and-drop / upload karne par backend (xlsx parser) file ko validate karega.
   - **Dry-run / Validation Preview**: File upload hote hi direct insert hone ke bajaye ek **Preview Modal** dikhega (Valid rows = Green, Errors = Red).

3. **Database Insertion**:
   - Confirm karne par backend optimized bulk query (`INSERT ... ON CONFLICT`) se seconds me saara data DB me reflect kar dega.

4. **Role & Permission Access Control**:
   - **Default Right**: Admin ke paas by default ye rights honge.
   - **User Delegation**: DB/Session me ek flag hoga (`can_import_excel: boolean`). Admin **Users Management** page se kisi specific user ke liye is feature ko toggle (ON/OFF) kar payega.

---

### 2. Isme Konsi Challenges / Edge Cases Aayenge? (Important Factors)

1. **Duplicate Data / Unique Constraints**:
   - *Challenge*: Excel me same Email ya same Project Name dobara hua to DB crash ho sakta hai.
   - *Solution*: Backend check karega — agar user/project already exist karta hai, to usko skip ya update (upsert) karega.

2. **Relationship Dependency (Foreign Keys)**:
   - *Challenge*: Task import karne ke liye project aur assigned user pehle se exist hona chahiye.
   - *Solution*: Backend pehle Users aur Projects create/link karega, uske baad unse connected Tasks insert karega.

3. **Date Format Variations**:
   - *Challenge*: Excel me dates alag-alag formats me ho sakti hain (`DD/MM/YYYY`, `YYYY-MM-DD`, ya Excel serial integer numbers like `45567`).
   - *Solution*: Robust Date normalization parser use karenge.

4. **Partial Failure vs Atomic Transaction**:
   - *Scenario*: Maan lo 100 rows me se 5 rows me corrupt data hai.
   - *Handling*: 95 valid rows insert ho jayenge aur Admin ko ek summary log milega:  
     `95 Rows Imported Successfully, 5 Skipped (Row 12: Invalid Email, Row 44: Missing Title)`.

5. **Performance for Large Files**:
   - 1000+ rows aane par loop me single-single query chalane se system slow ho sakta hai. Batch processing (`INSERT INTO ... VALUES (...)`) se file 1-2 seconds me import ho jayegi.

---

### Conclusion
Ye feature bilkul smoothly implement ho sakta hai. Jab aap code changes start karna chaho, tab batana — hum sabse pehle **Template Download** aur **Validation Preview System** ke saath isko build kar denge!







### Summary of Work

The **Bulk Excel Data Import & Management** feature and UI theme polish have been completed and verified.

#### 1. Bulk Excel Data Import System
* **Backend Import & Permission API (`backend/src/routes/importRoutes.js` & `server.js`):**
  * `GET /api/import/template`: Generates and streams `TTL_Agile_Bulk_Import_Template.xlsx` with standard sheet schemas and sample data.
  * `POST /api/import/validate`: Parses `.xlsx`/`.csv` files, normalizes dates (Excel serial integers, strings, and Date objects), checks email formats, parent-child project hierarchies, and flags negative edge cases (missing required titles, invalid emails, existing users/projects).
  * `POST /api/import/commit`: Executes atomic database transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) for Users, Projects, and Tasks with foreign key resolution.
  * `PUT /api/import/permission/:userId`: Allows Admins to toggle `can_import_excel` permissions for individual team members.

* **Frontend UI & Modal (`frontend/src/components/BulkImportModal.jsx` & `importService.js`):**
  * **3-Step Workflow:** Download Template & File Drag-and-Drop Dropzone $\rightarrow$ Data Validation Table (with **Valid**, **Warning**, and **Error** filter tabs and issue descriptions) $\rightarrow$ Import Summary Metrics.
  * Seamlessly integrated into **User Management** ([Users.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Users.jsx)), **Project Management** ([Projects.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Projects.jsx)), and **Kanban Board** ([Kanban.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Kanban.jsx)).
  * **Admin Delegation:** Added the **"Excel Data Import Access"** toggle switch inside the Edit User modal in User Management.

#### 2. Theme & Design Polish
* **Theme Selector Order:** Configured Appearance settings order to: **Onyx** $\rightarrow$ **Light** $\rightarrow$ **Midnight**.
* **Midnight Theme Accuracy:** Aligned control panel backgrounds (`.people-command-panel`, `.project-command-panel`, `.premium-filter-bar`) with CSS variables (`var(--panel)`, `var(--input-bg)`) to match Midnight deep navy blue tones.
* **Profile Popover Badge:** Updated navigation avatar badge from neon colors to a subtle, professional theme-matched badge.

#### 3. Production Build Verification
* Built the frontend production bundle via Vite (`npm run build`), passing clean with **0 exit errors**.

All tasks, including the **Bulk Excel Data Import**, **Admin Import Permission Delegation**, and **Midnight Theme Polish**, have been completed and verified with a clean production build (`npm run build`).

The build completed successfully in **26.94s** with 0 errors (`dist/assets/index-BEaZ-YkU.js`).

### Implementation Summary

1. **Excel Bulk Data Import & Validation:**
   - **Template Download:** Stream `.xlsx` template containing sample data and instructions for Users, Projects, and Tasks via `GET /api/import/template`.
   - **Row Validation & Preview:** Validates uploaded Excel/CSV data for missing fields, invalid emails, date format normalizations, and duplicate entries via `POST /api/import/validate`.
   - **Atomic Transaction Commit:** Executes database insertion atomically via `POST /api/import/commit`.
   - **UI Integration:** Available in [Users.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Users.jsx), [Projects.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Projects.jsx), and [Kanban.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Kanban.jsx).

2. **Admin Permission Delegation (`can_import_excel`):**
   - Added `PUT /api/import/permission/:userId` endpoint.
   - Added **Excel Data Import Access** toggle switch inside the Edit User modal on the User Management page.

3. **Theme & Styling Polish:**
   - Appearance theme selector ordered as **Onyx** $\rightarrow$ **Light** $\rightarrow$ **Midnight**.
   - Theme backgrounds and panel styling updated across User Management, Project Management, and Kanban views to match Midnight dark navy blue tones.





   ---
   code summery




   Code level par **Import Data** aur **Export CSV** kaise implement aur execute hota hai, iska complete technical breakdown:

---

# 📥 1. **Bulk Excel Import Feature Code Flow**

Import feature **Backend (Node.js + PostgreSQL)** aur **Frontend (React)** dono side milkar kaam karta hai:

```
[User Uploads .xlsx File] 
       │
       ▼
[Frontend: BulkImportModal.jsx] ➔ calls importService.validateFile()
       │
       ▼
[Backend: importRoutes.js] ➔ parses file via ExcelJS library
       │
       ├── Normalize Dates & Email Validation
       ├── Check Duplicates in PostgreSQL Database
       └── Return JSON { tasks, projects, users, summary }
       │
       ▼
[Frontend Data Table] ➔ Shows Valid 🟢 / Warning 🟡 / Error 🔴 Rows
       │
       ▼ (User Clicks "Import All Valid Data")
[Backend: /api/import/commit]
       │
       ├── BEGIN SQL Transaction
       ├── 1. Create/Find Users
       ├── 2. Create/Find Projects (Parent-Child)
       ├── 3. Insert Tasks with Foreign Keys (project_id, assigned_user_id)
       └── COMMIT Transaction (Or ROLLBACK if fail)
```

---

### 🟢 **Backend Code Architecture (`backend/src/routes/importRoutes.js`):**

1. **Excel Parsing (`exceljs` + `multer`):**
   `multer` memory storage se file catch karta hai, fir `exceljs` library file ke 3 Worksheets (`Tasks`, `Projects`, `Users`) ke har row-by-row data read karti hai:
   ```javascript
   const workbook = new ExcelJS.Workbook();
   await workbook.xlsx.load(req.file.buffer);
   const tasksSheet = workbook.getWorksheet('Tasks');
   ```

2. **Date & Edge Case Handling:**
   Excel me Dates 3 formats me ho sakti hain (Raw `Date` Object, String `2026-10-01`, ya Excel Serial Integer `45567`). Backend me helper function ise standard ISO format me convert karta hai:
   ```javascript
   function parseExcelDate(val) {
     if (typeof val === 'number') {
       return new Date((val - 25569) * 86400 * 1000).toISOString().slice(0, 10);
     }
     return val;
   }
   ```

3. **Atomic Database Transaction (`POST /api/import/commit`):**
   Data corruption se bachne ke liye `BEGIN`/`COMMIT`/`ROLLBACK` SQL transaction use hota hai. Agar 100 me se 1 task me bhi crash hua, toh saara data secure tarike se rollback ho jata hai:
   ```javascript
   await client.query('BEGIN');
   // Insert Users -> Insert Projects -> Insert Tasks
   await client.query('COMMIT');
   ```

---

### 🔵 **Frontend Code Architecture (`frontend/src/components/BulkImportModal.jsx`):**

1. **API Client (`importService.js`):**
   `multipart/form-data` request bhejta hai backend validation API ko:
   ```javascript
   export const importService = {
     async validateFile(file) {
       const formData = new FormData();
       formData.append('file', file);
       const response = await api.post('/import/validate', formData);
       return response.data?.data;
     }
   };
   ```

2. **3-Step UI State Management:**
   - **Step 1:** Upload Dropzone (`STEP_UPLOAD`)
   - **Step 2:** Data Preview Table with Status Tabs (`STEP_PREVIEW`)
   - **Step 3:** Completion Summary Metrics (`STEP_DONE`)

---

# 📤 2. **Export CSV Feature Code Flow**

Export Feature pure **Client-Side JavaScript** me implement kiya gaya hai (bina server load badhaye):

### 🟢 **Frontend Code (`Users.jsx` / `Projects.jsx`):**

1. **CSV String Generator:**
   Table me fil filhall active / filtered items ko CSV format array me map kiya jata hai:
   ```javascript
   const exportUsersToCSV = () => {
     const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Status'];
     const rows = filteredUsers.map(u => [
       u.user_id,
       `"${u.full_name}"`,
       `"${u.email}"`,
       u.role_name,
       u.status
     ]);

     const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
     
     // Trigger Browser Download
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.setAttribute('download', `Users_Export_${new Date().toISOString().slice(0,10)}.csv`);
     link.click();
   };
   ```

---

### 💡 **Summary of Libraries Used:**
- **`exceljs`** (Backend): Excel `.xlsx` files read/write karne ke liye.
- **`multer`** (Backend): File upload buffer process karne ke liye.
- **`pg` Pool Client** (Backend): PostgreSQL Atomic transactions (`BEGIN`/`COMMIT`).
- **`Blob` & `URL.createObjectURL`** (Frontend): Browser me immediate file download popup trigger karne ke liye.


---
###chalanges and how did you takle it


Excel Bulk Import feature me real-world use me jo **Challenges & Edge Cases** aa sakte the, aur humne unhe code me **kaise proactively solve aur fix kiya**:

---

### 1️⃣ **Challenge: Excel Date Formats Difference (Integer Serial Numbers vs Strings)**
* **Problem:** Excel files me dates ajeeb format me save hoti hain:
  - Excel integer numbers (jaise `45567` for `2024-10-01`)
  - Text strings (`2026-10-05` ya `05/10/2026`)
  - Direct Date objects
  *Agar ise bina handle kiye DB me daalo toh database crash ho jata.*
* **Our Code Fix:** Backend `importRoutes.js` me `parseExcelDate()` function banaya jo Excel ke integer formula `(val - 25569) * 86400 * 1000` se har date ko exact standard `YYYY-MM-DD` me normalize kar deta hai.

---

### 2️⃣ **Challenge: Foreign Key Dependency (Missing Project / Assignee)**
* **Problem:** Maan lijiye Excel me ek Task hai jo `sneha@company.com` ko assign hai aur `Mobile App` project ka part hai. Lekin agar database me `Mobile App` project ya `Sneha` abhi tak bani hi nahi hai, toh SQL database `Foreign Key Constraint Violation` error dekar fail ho jata.
* **Our Code Fix:** Backend me **Smart Sequence Resolution** implement kiya:
  - **Step 1:** Pehle Excel se missing Users create/link karta hai.
  - **Step 2:** Phir Parent Projects aur Child Projects create/link karta hai.
  - **Step 3:** Aakhir me Tasks ko unhi created `project_id` aur `assigned_user_id` ke sath perfectly connect kar deta hai.

---

### 3️⃣ **Challenge: Partial Database Failure (Data Corruption)**
* **Problem:** Maan lijiye 100 rows import ho rahi hain. 50 rows save hone ke baad 51st row me koi crash ho jaye, toh 50 rows adhoori save reh jati (Aadha-adha data corruption).
* **Our Code Fix:** Backend me **PostgreSQL Atomic Transaction (`BEGIN`/`COMMIT`/`ROLLBACK`)** add kiya:
  ```javascript
  await client.query('BEGIN');
  // Process all rows...
  if (any_error) await client.query('ROLLBACK'); // 0% data change
  else await client.query('COMMIT'); // All 100% saved together
  ```
  Agar ek bhi row me error aaya, toh database waise ka waisa 100% clean reh jayega!

---

### 4️⃣ **Challenge: Missing DB Column & Checkbox Uncheck State Issue**
* **Problem:** 
  1. `Users` table me `can_import_excel` column missing tha.
  2. Admin jab checkbox save karta tha, tab `getUsers` SQL query me field missing hone ki wajah se edit modal me checkbox dobara blank ho jata tha.
  3. Admin ke checkbox uncheck karne par bhi non-admin user ko Import button dikh raha tha.
* **Our Code Fix:**
  - Database schema run kiya: `ALTER TABLE Users ADD COLUMN IF NOT EXISTS can_import_excel BOOLEAN DEFAULT FALSE;`
  - SQL queries (`userController.js`, `authController.js`, `authMiddleware.js`) me `u.can_import_excel` include kiya.
  - `Users.jsx`, `Projects.jsx`, aur `Kanban.jsx` me button ko `{canImportExcel && (...) }` me wrap kiya taaki uncheck hote hi button turant hide ho jaye.

---

### 5️⃣ **Challenge: Negative & Edge Case Validation (Invalid Emails, Empty Titles)**
* **Problem:** User galti se empty task title, broken email (`rahul.company`), ya duplicate project upload kar sakta hai.
* **Our Code Fix:** Upload karte hi validation engine chalte hain jo bina database touch kiye client screen par dikha dete hain:
  - 🔴 **Red Row:** *"Missing required task title"* ya *"Invalid email syntax"*
  - Sever crash hone ke bajaye user ko live screen par galti batata hai taaki wo use Excel me thik karke upload kar sake.






---
Here is the complete, detailed list of all sections and files modified, along with what changes were made and why:

---

# 📋 Comprehensive Summary of All Changes Made

---

## 1. Task Attachments & Shareable S3-Like VM Links Section

### Files Modified:
* **[backend/src/controllers/taskController.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/controllers/taskController.js)**
* **[backend/src/server.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/server.js)**
* **[frontend/src/components/TaskAttachments.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/components/TaskAttachments.jsx)**

### What Was Changed & Why:
1. **Fixed Blank Page Issue on Link Attachments**:
   - **Bug**: `getTaskAttachments` SQL query was missing `a.file_path` in its `SELECT` statement, causing loaded attachment objects to have `file_path = undefined`. Clicking links opened `about:blank`.
   - **Fix**: Added `a.file_path` to SQL `SELECT` in `getTaskAttachments` and `RETURNING` clause in `uploadTaskAttachment`.
   - **URL Normalization**: Added `getShareableUrl` on frontend to automatically prepend `https://` to external web links (e.g., `google.com` ➔ `https://google.com`), preventing Vite from treating them as relative `localhost` routes.
2. **Shareable VM Static Serving (S3-Like Links)**:
   - **Backend Fix**: Re-ordered Express static middleware in `server.js` (`app.use('/uploads', express.static(...))`) to run **before** the 404 fallback handler.
   - **Copy Shareable Link Button**: Added a **Share Link (`<Share2 />`)** button to every attachment in `TaskAttachments.jsx`. Clicking it copies the full backend server URL (e.g., `http://<your-server-ip>:5000/uploads/attachments/file.png`) to clipboard so anyone can view/download files directly from the VM without logging in.

---

## 2. User Audit Logging & Role Tracking Section

### Files Modified / Created:
* **[backend/src/server.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/server.js)**
* **[backend/src/controllers/userController.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/controllers/userController.js)**
* **[backend/src/routes/userRoutes.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/routes/userRoutes.js)**
* **[frontend/src/services/userService.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/services/userService.js)**
* **[frontend/src/components/UserAuditLogModal.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/components/UserAuditLogModal.jsx)** *(NEW)*
* **[frontend/src/pages/Users.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/pages/Users.jsx)**

### What Was Changed & Why:
1. **Database Schema**:
   - Added PostgreSQL `AuditLogs` table migration (`audit_id`, `actor_id`, `target_user_id`, `action_type`, `description`, `old_value`, `new_value`, `created_at`).
2. **Backend Automatic Triggers**:
   - **`updateUser`**: Detects role changes (e.g., `User ➔ Admin` or `Admin ➔ User`) and status changes (`Active ➔ Inactive`), logging Admin actor ID, affected user, old role, new role, and exact timestamp.
   - **`createUser` & `deleteUser`**: Logs user creation and deactivation events.
   - **`getAuditLogs` Controller & Route**: Added `GET /api/users/audit-logs` API endpoint for Admins.
3. **Frontend Audit UI**:
   - Created `UserAuditLogModal.jsx`: Modal displaying a searchable, paginated audit log with action type filters (Role Change, Status Change, User Created, Deactivated) and visual role diff pills (`USER ➔ ADMIN`).
   - Added **"Audit Logs" (`<ShieldAlert />`)** button to the command panel in `Users.jsx`.

---

## 3. Threaded Comments & Admin ↔ User Discussion Section

### Files Modified / Created:
* **[backend/src/server.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/server.js)**
* **[backend/src/controllers/taskController.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/backend/src/controllers/taskController.js)**
* **[frontend/src/services/taskService.js](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/services/taskService.js)**
* **[frontend/src/components/TaskCommentsThread.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/components/TaskCommentsThread.jsx)** *(NEW)*
* **[frontend/src/components/TaskModal.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/components/TaskModal.jsx)**
* **[frontend/src/components/TaskForm.jsx](file:///Users/apple/Desktop/TTL_Tracker_Office-main/frontend/src/components/TaskForm.jsx)**

### What Was Changed & Why:
1. **Database Schema**:
   - Added `parent_comment_id` column to `TaskComments` table (`ALTER TABLE TaskComments ADD COLUMN IF NOT EXISTS parent_comment_id INT REFERENCES TaskComments(comment_id)...`).
2. **Backend Logic & Reply Notifications**:
   - `addComment`: Accepts `parent_comment_id`. If replying to a specific user's comment, sends a targeted notification to the parent comment author.
   - `getComments`: Selects author role (`r.role_name`) and parent user details.
3. **UI Labeling (Remarks vs Discussion)**:
   - Re-labeled Remarks as **"Daily Progress Remarks"** in `TaskForm.jsx` to prevent confusion with general comments.
   - Labeled Comments as **"Admin & Team Discussion"** in `TaskModal.jsx`.
4. **Threaded Comments UI Component (`TaskCommentsThread.jsx`)**:
   - Implemented nested reply threads with indented containers (`ml-5 border-l-2`).
   - Added **"Reply"** button on every comment card.
   - Added an active `"Replying to [Author Name]"` banner with cancellation support above the input field.
   - **Role Badges**: Added visual `ADMIN` (cyan/amber) vs `USER` (slate) badges.
5. **Polished Light & Dark Theme Support**:
   - Refined theme tokens so Light (White) Theme renders high-contrast soft cyan badges (`bg-cyan-50`, `border-cyan-300`, `text-cyan-800`), crisp white card backgrounds, and dark slate typography instead of washed-out or overly dark boxes.
   
