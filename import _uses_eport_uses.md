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
