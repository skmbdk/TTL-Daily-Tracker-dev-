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
