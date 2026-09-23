-- USE ZiraAgile;
-- GO

-- INSERT INTO Roles (role_name)
-- SELECT 'admin' WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE role_name = 'admin');

-- INSERT INTO Roles (role_name)
-- SELECT 'user' WHERE NOT EXISTS (SELECT 1 FROM Roles WHERE role_name = 'user');

-- DECLARE @adminRoleId INT = (SELECT role_id FROM Roles WHERE role_name = 'admin');
-- DECLARE @userRoleId INT = (SELECT role_id FROM Roles WHERE role_name = 'user');

-- IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'admin@zira.local')
-- BEGIN
--     INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
--     VALUES (
--         'Priya Raman',
--         'admin@zira.local',
--         '$2b$12$doBXcvql6C/SZZJRqHX3H.F0Pap6eJrlNytjgBWgNiZYMKNpbmyP2',
--         @adminRoleId,
--         'PMO',
--         'Delivery Manager',
--         'Active'
--     );
-- END

-- IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'alex.chen@zira.local')
-- BEGIN
--     INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
--     VALUES (
--         'Alex Chen',
--         'alex.chen@zira.local',
--         '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
--         @userRoleId,
--         'Engineering',
--         'Frontend Engineer',
--         'Active'
--     );
-- END

-- IF NOT EXISTS (SELECT 1 FROM Users WHERE email = 'maya.patel@zira.local')
-- BEGIN
--     INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
--     VALUES (
--         'Maya Patel',
--         'maya.patel@zira.local',
--         '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
--         @userRoleId,
--         'QA',
--         'QA Analyst',
--         'Active'
--     );
-- END

-- DECLARE @adminId INT = (SELECT user_id FROM Users WHERE email = 'admin@zira.local');
-- DECLARE @alexId INT = (SELECT user_id FROM Users WHERE email = 'alex.chen@zira.local');
-- DECLARE @mayaId INT = (SELECT user_id FROM Users WHERE email = 'maya.patel@zira.local');

-- IF NOT EXISTS (SELECT 1 FROM Projects WHERE project_name = 'Atlas Portal')
-- BEGIN
--     INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
--     VALUES ('Atlas Portal', 'Customer operations portal migration.', '2026-04-01', '2026-06-30', 'Active', @adminId);
-- END

-- IF NOT EXISTS (SELECT 1 FROM Projects WHERE project_name = 'Nimbus Analytics')
-- BEGIN
--     INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
--     VALUES ('Nimbus Analytics', 'Executive analytics and reporting platform.', '2026-03-15', '2026-07-15', 'Active', @adminId);
-- END

-- DECLARE @atlasId INT = (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal');
-- DECLARE @nimbusId INT = (SELECT project_id FROM Projects WHERE project_name = 'Nimbus Analytics');

-- INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
-- SELECT @atlasId, @alexId, 'Frontend'
-- WHERE NOT EXISTS (SELECT 1 FROM ProjectMembers WHERE project_id = @atlasId AND user_id = @alexId);

-- INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
-- SELECT @atlasId, @mayaId, 'QA'
-- WHERE NOT EXISTS (SELECT 1 FROM ProjectMembers WHERE project_id = @atlasId AND user_id = @mayaId);

-- INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
-- SELECT @nimbusId, @alexId, 'UI'
-- WHERE NOT EXISTS (SELECT 1 FROM ProjectMembers WHERE project_id = @nimbusId AND user_id = @alexId);

-- IF NOT EXISTS (SELECT 1 FROM Tasks WHERE task_title = 'Build sprint dashboard shell')
-- BEGIN
--     INSERT INTO Tasks (
--         task_title, description, assigned_user_id, employee_name, status, priority,
--         project_id, module_name, start_date, due_date, onsite_offshore, remarks, created_by
--     )
--     VALUES (
--         'Build sprint dashboard shell',
--         'Create the dashboard layout, metrics cards, and activity feed.',
--         @alexId,
--         'Alex Chen',
--         'In Progress',
--         'High',
--         @atlasId,
--         'Dashboard',
--         '2026-04-20',
--         '2026-04-30',
--         'Offshore',
--         'Waiting for final KPI labels.',
--         @adminId
--     );
-- END

-- IF NOT EXISTS (SELECT 1 FROM Tasks WHERE task_title = 'Validate Excel tracker import')
-- BEGIN
--     INSERT INTO Tasks (
--         task_title, description, assigned_user_id, employee_name, status, priority,
--         project_id, module_name, start_date, due_date, onsite_offshore, remarks, created_by
--     )
--     VALUES (
--         'Validate Excel tracker import',
--         'Check exact column mapping and reject invalid tracker files.',
--         @mayaId,
--         'Maya Patel',
--         'Testing',
--         'Critical',
--         @atlasId,
--         'Import',
--         '2026-04-22',
--         '2026-04-27',
--         'Onsite',
--         'Employee Name and Onsite/Offshore must remain distinct.',
--         @adminId
--     );
-- END

-- IF NOT EXISTS (SELECT 1 FROM Tasks WHERE task_title = 'Add project progress report')
-- BEGIN
--     INSERT INTO Tasks (
--         task_title, description, assigned_user_id, employee_name, status, priority,
--         project_id, module_name, start_date, due_date, onsite_offshore, remarks, created_by
--     )
--     VALUES (
--         'Add project progress report',
--         'Generate project-wise export worksheet and dashboard rollup.',
--         @alexId,
--         'Alex Chen',
--         'Backlog',
--         'Medium',
--         @nimbusId,
--         'Reports',
--         '2026-04-25',
--         '2026-05-05',
--         'Offshore',
--         'Needs sample data review.',
--         @adminId
--     );
-- END

-- INSERT INTO TaskHistory (task_id, changed_by, old_status, new_status, old_priority, new_priority, change_description)
-- SELECT task_id, @adminId, NULL, status, NULL, priority, 'Seed task created'
-- FROM Tasks t
-- WHERE NOT EXISTS (
--     SELECT 1 FROM TaskHistory h WHERE h.task_id = t.task_id AND h.change_description = 'Seed task created'
-- );

-- INSERT INTO TaskComments (task_id, user_id, comment_text)
-- SELECT t.task_id, @alexId, 'Initial implementation started.'
-- FROM Tasks t
-- WHERE t.task_title = 'Build sprint dashboard shell'
--   AND NOT EXISTS (SELECT 1 FROM TaskComments c WHERE c.task_id = t.task_id AND c.comment_text = 'Initial implementation started.');
-- GO


-- PostgreSQL Seed Data for jira Agile Task Management System

INSERT INTO Roles (role_name) VALUES ('admin'), ('user') ON CONFLICT (role_name) DO NOTHING;

-- Primary Admin User (Jayant Pattanaik)
INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Pattanaik, Jayant',
    'jayant.pattanaik@ttl.com',
    '$2b$12$doBXcvql6C/SZZJRqHX3H.F0Pap6eJrlNytjgBWgNiZYMKNpbmyP2',
    (SELECT role_id FROM Roles WHERE role_name = 'admin'),
    'Delivery',
    'Project Director',
    'Active'
) ON CONFLICT (email) DO NOTHING;

-- Initial Sample Users
INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Alex Chen',
    'alex.chen@jira.local',
    '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
    (SELECT role_id FROM Roles WHERE role_name = 'user'),
    'Engineering',
    'Frontend Engineer',
    'Active'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
VALUES (
    'Maya Patel',
    'maya.patel@jira.local',
    '$2b$12$YBw0cHJe8GZ7uUIkx0wP9e.T5gwMGN96hBGoDAglgtG9VX2D97Zf.',
    (SELECT role_id FROM Roles WHERE role_name = 'user'),
    'QA',
    'QA Analyst',
    'Active'
) ON CONFLICT (email) DO NOTHING;

-- Initial Sample Projects
INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    'Atlas Portal',
    'Customer operations portal migration.',
    '2026-04-01',
    '2026-06-30',
    'Active',
    (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com')
) ON CONFLICT (project_name) DO NOTHING;

INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
VALUES (
    'Nimbus Analytics',
    'Executive analytics and reporting platform.',
    '2026-03-15',
    '2026-07-15',
    'Active',
    (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com')
) ON CONFLICT (project_name) DO NOTHING;

-- Initial Project Members
INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
VALUES 
(
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    (SELECT user_id FROM Users WHERE email = 'alex.chen@jira.local'),
    'Frontend'
),
(
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    (SELECT user_id FROM Users WHERE email = 'maya.patel@jira.local'),
    'QA'
),
(
    (SELECT project_id FROM Projects WHERE project_name = 'Nimbus Analytics'),
    (SELECT user_id FROM Users WHERE email = 'alex.chen@jira.local'),
    'UI'
) ON CONFLICT (project_id, user_id) DO NOTHING;

-- Initial Sample Tasks
INSERT INTO Tasks (
    task_title, description, assigned_user_id, employee_name, status, priority,
    project_id, module_name, start_date, due_date, onsite_offshore, remarks, created_by
)
VALUES (
    'Build sprint dashboard shell',
    'Create the dashboard layout, metrics cards, and activity feed.',
    (SELECT user_id FROM Users WHERE email = 'alex.chen@jira.local'),
    'Alex Chen',
    'In Progress',
    'High',
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    'Dashboard',
    '2026-04-20',
    '2026-04-30',
    'Offshore',
    'Waiting for final KPI labels.',
    (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com')
),
(
    'Validate Excel tracker import',
    'Check exact column mapping and reject invalid tracker files.',
    (SELECT user_id FROM Users WHERE email = 'maya.patel@jira.local'),
    'Maya Patel',
    'Testing',
    'Critical',
    (SELECT project_id FROM Projects WHERE project_name = 'Atlas Portal'),
    'Import',
    '2026-04-22',
    '2026-04-27',
    'Onsite',
    'Employee Name and Onsite/Offshore must remain distinct.',
    (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com')
),
(
    'Add project progress report',
    'Generate project-wise export worksheet and dashboard rollup.',
    (SELECT user_id FROM Users WHERE email = 'alex.chen@jira.local'),
    'Alex Chen',
    'Backlog',
    'Medium',
    (SELECT project_id FROM Projects WHERE project_name = 'Nimbus Analytics'),
    'Reports',
    '2026-04-25',
    '2026-05-05',
    'Offshore',
    'Needs sample data review.',
    (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com')
);

INSERT INTO TaskHistory (task_id, changed_by, old_status, new_status, old_priority, new_priority, change_description)
SELECT task_id, (SELECT user_id FROM Users WHERE email = 'jayant.pattanaik@ttl.com'), NULL, status, NULL, priority, 'Seed task created'
FROM Tasks;

INSERT INTO TaskComments (task_id, user_id, comment_text)
SELECT t.task_id, (SELECT user_id FROM Users WHERE email = 'alex.chen@jira.local'), 'Initial implementation started.'
FROM Tasks t
WHERE t.task_title = 'Build sprint dashboard shell';
