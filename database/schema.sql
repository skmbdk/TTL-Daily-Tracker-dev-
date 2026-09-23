-- -- IF DB_ID(N'ZiraAgile') IS NULL
-- -- BEGIN
-- --     CREATE DATABASE ZiraAgile;
-- -- END
-- -- GO

-- -- USE ZiraAgile;
-- -- GO

-- IF OBJECT_ID(N'TaskHistory', N'U') IS NOT NULL DROP TABLE TaskHistory;
-- IF OBJECT_ID(N'TaskRemarks', N'U') IS NOT NULL DROP TABLE TaskRemarks;
-- IF OBJECT_ID(N'TaskComments', N'U') IS NOT NULL DROP TABLE TaskComments;
-- IF OBJECT_ID(N'ExcelImports', N'U') IS NOT NULL DROP TABLE ExcelImports;
-- IF OBJECT_ID(N'Tasks', N'U') IS NOT NULL DROP TABLE Tasks;
-- IF OBJECT_ID(N'ProjectMembers', N'U') IS NOT NULL DROP TABLE ProjectMembers;
-- IF OBJECT_ID(N'Projects', N'U') IS NOT NULL DROP TABLE Projects;
-- IF OBJECT_ID(N'Users', N'U') IS NOT NULL DROP TABLE Users;
-- IF OBJECT_ID(N'Roles', N'U') IS NOT NULL DROP TABLE Roles;
-- GO

-- CREATE TABLE Roles (
--     role_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Roles PRIMARY KEY,
--     role_name NVARCHAR(50) NOT NULL CONSTRAINT UQ_Roles_role_name UNIQUE,
--     CONSTRAINT CK_Roles_role_name CHECK (role_name IN ('admin', 'user'))
-- );

-- CREATE TABLE Users (
--     user_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
--     full_name NVARCHAR(150) NOT NULL,
--     email NVARCHAR(255) NOT NULL CONSTRAINT UQ_Users_email UNIQUE,
--     password_hash NVARCHAR(255) NOT NULL,
--     role_id INT NOT NULL,
--     department NVARCHAR(100) NULL,
--     designation NVARCHAR(100) NULL,
--     status NVARCHAR(30) NOT NULL CONSTRAINT DF_Users_status DEFAULT 'Active',
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Users_created_at DEFAULT SYSUTCDATETIME(),
--     updated_at DATETIME2(0) NULL,
--     CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id) REFERENCES Roles(role_id),
--     CONSTRAINT CK_Users_status CHECK (status IN ('Active', 'Inactive'))
-- );

-- CREATE TABLE Projects (
--     project_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Projects PRIMARY KEY,
--     project_name NVARCHAR(160) NOT NULL CONSTRAINT UQ_Projects_project_name UNIQUE,
--     description NVARCHAR(MAX) NULL,
--     parent_project_id INT NULL,
--     start_date DATE NULL,
--     end_date DATE NULL,
--     status NVARCHAR(30) NOT NULL CONSTRAINT DF_Projects_status DEFAULT 'Active',
--     created_by INT NOT NULL,
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Projects_created_at DEFAULT SYSUTCDATETIME(),
--     updated_at DATETIME2(0) NULL,
--     CONSTRAINT FK_Projects_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(user_id),
--     CONSTRAINT FK_Projects_Parent FOREIGN KEY (parent_project_id) REFERENCES Projects(project_id),
--     CONSTRAINT CK_Projects_status CHECK (status IN ('Active', 'On Hold', 'Completed', 'Archived'))
-- );

-- CREATE TABLE ProjectMembers (
--     project_member_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProjectMembers PRIMARY KEY,
--     project_id INT NOT NULL,
--     user_id INT NOT NULL,
--     role_in_project NVARCHAR(80) NULL,
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_ProjectMembers_created_at DEFAULT SYSUTCDATETIME(),
--     CONSTRAINT FK_ProjectMembers_Projects FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
--     CONSTRAINT FK_ProjectMembers_Users FOREIGN KEY (user_id) REFERENCES Users(user_id),
--     CONSTRAINT UQ_ProjectMembers_project_user UNIQUE (project_id, user_id)
-- );

-- CREATE TABLE Tasks (
--     task_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Tasks PRIMARY KEY,
--     task_title NVARCHAR(255) NOT NULL,
--     description NVARCHAR(MAX) NULL,
--     assigned_user_id INT NULL,
--     employee_name NVARCHAR(150) NULL,
--     status NVARCHAR(40) NOT NULL CONSTRAINT DF_Tasks_status DEFAULT 'To Do',
--     priority NVARCHAR(40) NOT NULL CONSTRAINT DF_Tasks_priority DEFAULT 'Medium',
--     project_id INT NULL,
--     module_name NVARCHAR(120) NULL,
--     start_date DATE NULL,
--     end_date DATE NULL,
--     due_date DATE NULL,
--     onsite_offshore NVARCHAR(30) NULL,
--     remarks NVARCHAR(MAX) NULL,
--     created_by INT NOT NULL,
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_Tasks_created_at DEFAULT SYSUTCDATETIME(),
--     updated_at DATETIME2(0) NULL,
--     CONSTRAINT FK_Tasks_AssignedUser FOREIGN KEY (assigned_user_id) REFERENCES Users(user_id),
--     CONSTRAINT FK_Tasks_Project FOREIGN KEY (project_id) REFERENCES Projects(project_id),
--     CONSTRAINT FK_Tasks_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(user_id),
--     CONSTRAINT CK_Tasks_status CHECK (status IN ('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Done', 'Blocked')),
--     CONSTRAINT CK_Tasks_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
--     CONSTRAINT CK_Tasks_onsite_offshore CHECK (onsite_offshore IS NULL OR onsite_offshore IN ('Onsite', 'Offshore'))
-- );

-- CREATE TABLE TaskComments (
--     comment_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskComments PRIMARY KEY,
--     task_id INT NOT NULL,
--     user_id INT NOT NULL,
--     comment_text NVARCHAR(MAX) NOT NULL,
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_TaskComments_created_at DEFAULT SYSUTCDATETIME(),
--     CONSTRAINT FK_TaskComments_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
--     CONSTRAINT FK_TaskComments_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
-- );

-- CREATE TABLE TaskRemarks (
--     remark_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskRemarks PRIMARY KEY,
--     task_id INT NOT NULL,
--     user_id INT NOT NULL,
--     remark_date DATE NOT NULL,
--     remark_text NVARCHAR(MAX) NOT NULL,
--     created_at DATETIME2(0) NOT NULL CONSTRAINT DF_TaskRemarks_created_at DEFAULT SYSUTCDATETIME(),
--     updated_at DATETIME2(0) NULL,
--     CONSTRAINT FK_TaskRemarks_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
--     CONSTRAINT FK_TaskRemarks_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
-- );

-- CREATE TABLE TaskHistory (
--     history_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskHistory PRIMARY KEY,
--     task_id INT NOT NULL,
--     changed_by INT NULL,
--     old_status NVARCHAR(40) NULL,
--     new_status NVARCHAR(40) NULL,
--     old_priority NVARCHAR(40) NULL,
--     new_priority NVARCHAR(40) NULL,
--     change_description NVARCHAR(MAX) NULL,
--     changed_at DATETIME2(0) NOT NULL CONSTRAINT DF_TaskHistory_changed_at DEFAULT SYSUTCDATETIME(),
--     CONSTRAINT FK_TaskHistory_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
--     CONSTRAINT FK_TaskHistory_Users FOREIGN KEY (changed_by) REFERENCES Users(user_id)
-- );

-- CREATE TABLE ExcelImports (
--     import_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ExcelImports PRIMARY KEY,
--     file_name NVARCHAR(255) NOT NULL,
--     imported_by INT NOT NULL,
--     total_rows INT NOT NULL CONSTRAINT DF_ExcelImports_total_rows DEFAULT 0,
--     success_rows INT NOT NULL CONSTRAINT DF_ExcelImports_success_rows DEFAULT 0,
--     failed_rows INT NOT NULL CONSTRAINT DF_ExcelImports_failed_rows DEFAULT 0,
--     imported_at DATETIME2(0) NOT NULL CONSTRAINT DF_ExcelImports_imported_at DEFAULT SYSUTCDATETIME(),
--     CONSTRAINT FK_ExcelImports_Users FOREIGN KEY (imported_by) REFERENCES Users(user_id)
-- );
-- GO

-- CREATE INDEX IX_Users_role_status ON Users(role_id, status);
-- CREATE INDEX IX_Tasks_assigned_status ON Tasks(assigned_user_id, status);
-- CREATE INDEX IX_Tasks_project_status ON Tasks(project_id, status);
-- CREATE INDEX IX_Tasks_due_date ON Tasks(due_date);
-- CREATE INDEX IX_Tasks_priority ON Tasks(priority);
-- CREATE INDEX IX_TaskHistory_task_changed_at ON TaskHistory(task_id, changed_at DESC);
-- CREATE INDEX IX_TaskComments_task_created_at ON TaskComments(task_id, created_at ASC);
-- CREATE INDEX IX_TaskRemarks_task_date ON TaskRemarks(task_id, remark_date DESC, created_at DESC);
-- GO



-- PostgreSQL Seed Data for jira Agile Task Management System

INSERT INTO Roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;

INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Priya Raman',
    'admin@zira.local',
    '$2b$12$doBXcvql6C/SZZJRqHX3H.F0Pap6eJrlNytjgBWgNiZYMKNpbmyP2',
    (SELECT role_id FROM Roles WHERE role_name = 'admin'),
    'PMO',
    'Delivery Manager',
    'Active'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Alex Chen',
    'alex.chen@zira.local',
    '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
    (SELECT role_id FROM Roles WHERE role_name = 'user'),
    'Engineering',
    'Frontend Engineer',
    'Active'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Maya Patel',
    'maya.patel@zira.local',
    '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
    (SELECT role_id FROM Roles WHERE role_name = 'user'),
    'QA',
    'QA Analyst',
    'Active'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    'Atlas Portal',
    'Customer operations portal migration.',
    '2026-04-01',
    '2026-06-30',
    'Active',
    (SELECT user_id FROM Users WHERE email = 'admin@zira.local')
) ON CONFLICT (project_name) DO NOTHING;

INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    'Nimbus Analytics',
    'Executive analytics and reporting platform.',
    '2026-03-15',
    '2026-07-15',
    'Active',
    (SELECT user_id FROM Users WHERE email = 'admin@zira.local')
) ON CONFLICT (project_name) DO NOTHING;

INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
VALUES 
(
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local'),
    'Frontend'
),
(
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    (SELECT user_id FROM Users WHERE email = 'maya.patel@zira.local'),
    'QA'
),
(
    (SELECT project_id FROM Projects WHERE project_name = 'Nimbus Analytics'),
    (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local'),
    'UI'
) ON CONFLICT (project_id, user_id) DO NOTHING;

INSERT INTO Tasks (
    task_title, description, assigned_user_id, employee_name, status, priority,
    project_id, module_name, start_date, due_date, onsite_offshore, remarks, created_by
)
VALUES (
    'Build sprint dashboard shell',
    'Create the dashboard layout, metrics cards, and activity feed.',
    (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local'),
    'Alex Chen',
    'In Progress',
    'High',
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    'Dashboard',
    '2026-04-20',
    '2026-04-30',
    'Offshore',
    'Waiting for final KPI labels.',
    (SELECT user_id FROM Users WHERE email = 'admin@zira.local')
),
(
    'Validate Excel tracker import',
    'Check exact column mapping and reject invalid tracker files.',
    (SELECT user_id FROM Users WHERE email = 'maya.patel@zira.local'),
    'Maya Patel',
    'Testing',
    'Critical',
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    'Import',
    '2026-04-22',
    '2026-04-27',
    'Onsite',
    'Employee Name and Onsite/Offshore must remain distinct.',
    (SELECT user_id FROM Users WHERE email = 'admin@zira.local')
),
(
    'Add project progress report',
    'Generate project-wise export worksheet and dashboard rollup.',
    (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local'),
    'Alex Chen',
    'Backlog',
    'Medium',
    (SELECT project_id FROM Projects WHERE project_name = 'Nimbus Analytics'),
    'Reports',
    '2026-04-25',
    '2026-05-05',
    'Offshore',
    'Needs sample data review.',
    (SELECT user_id FROM Users WHERE email = 'admin@zira.local')
);

INSERT INTO TaskHistory (task_id, changed_by, old_status, new_status, old_priority, new_priority, change_description)
SELECT task_id, (SELECT user_id FROM Users WHERE email = 'admin@zira.local'), NULL, status, NULL, priority, 'Seed task created'
FROM Tasks;

INSERT INTO TaskComments (task_id, user_id, comment_text)
SELECT t.task_id, (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local'), 'Initial implementation started.'
FROM Tasks t
WHERE t.task_title = 'Build sprint dashboard shell';
