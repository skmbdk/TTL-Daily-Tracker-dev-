import express from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';
import { protect } from '../middleware/authMiddleware.js';
import logger from '../config/logger.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

router.use(protect);

// Helper to check if user has import rights
const canUserImport = (req) => {
  if (req.user?.role_name === 'admin') return true;
  return Boolean(req.user?.can_import_excel);
};

// ==========================================
// 1. GET /api/import/template - Download Sample Template
// ==========================================
router.get('/template', async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Tata Technologies Agile Tracker';
    workbook.created = new Date();

    // ----------------------------------------
    // Sheet 1: Tasks Import
    // ----------------------------------------
    const tasksSheet = workbook.addWorksheet('Tasks_Import');
    tasksSheet.columns = [
      { header: 'Task Title *', key: 'title', width: 32 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Project Name *', key: 'project_name', width: 28 },
      { header: 'Assigned User Email', key: 'assigned_email', width: 30 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Priority', key: 'priority', width: 14 },
      { header: 'Story Points', key: 'story_points', width: 14 },
      { header: 'Stream / Module', key: 'module_name', width: 20 },
      { header: 'Start Date (YYYY-MM-DD)', key: 'start_date', width: 22 },
      { header: 'Due Date (YYYY-MM-DD)', key: 'due_date', width: 22 },
      { header: 'Location', key: 'location', width: 16 }
    ];

    // Style Header Row
    tasksSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    tasksSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0052D0' }
    };

    // Add Sample Task Rows
    tasksSheet.addRow({
      title: 'Configuration of SSO',
      description: 'Implement Single Sign-On integration with Okta for enterprise authentication.',
      project_name: 'Phinia - Implementation - Offshore',
      assigned_email: 'jayant.pattanaik@ttl.com',
      status: 'In Progress',
      priority: 'High',
      story_points: 3,
      module_name: 'Admin - Training',
      start_date: '2026-10-01',
      due_date: '2026-10-25',
      location: 'Offshore'
    });

    tasksSheet.addRow({
      title: 'BMIDE Assignment Validation',
      description: 'Validate data model extensions in Teamcenter sandbox environment.',
      project_name: 'BMIDE Assignments',
      assigned_email: 'gaurav.tiwari@ttl.com',
      status: 'To Do',
      priority: 'Medium',
      story_points: 5,
      module_name: 'Validation',
      start_date: '2026-10-05',
      due_date: '2026-11-10',
      location: 'Onsite'
    });

    // ----------------------------------------
    // Sheet 2: Projects Import
    // ----------------------------------------
    const projectsSheet = workbook.addWorksheet('Projects_Import');
    projectsSheet.columns = [
      { header: 'Project Name *', key: 'project_name', width: 32 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Parent Project Name', key: 'parent_project_name', width: 28 },
      { header: 'Status', key: 'status', width: 16 }
    ];

    projectsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    projectsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }
    };

    projectsSheet.addRow({
      project_name: 'Phinia - Integration - Onsite',
      description: 'Onsite PLM integration stream for Phinia automotive project.',
      parent_project_name: 'Phinia',
      status: 'Active'
    });

    // ----------------------------------------
    // Sheet 3: Users Import
    // ----------------------------------------
    const usersSheet = workbook.addWorksheet('Users_Import');
    usersSheet.columns = [
      { header: 'Full Name *', key: 'full_name', width: 28 },
      { header: 'Email *', key: 'email', width: 32 },
      { header: 'Role (admin/user)', key: 'role', width: 18 },
      { header: 'Designation', key: 'designation', width: 24 }
    ];

    usersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    usersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0284C7' }
    };

    usersSheet.addRow({
      full_name: 'Sharma, Vikram',
      email: 'vikram.sharma@ttl.com',
      role: 'user',
      designation: 'Tech Lead'
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="TTL_Agile_Bulk_Import_Template.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. POST /api/import/validate - Upload & Validate File
// ==========================================
router.post('/validate', upload.single('file'), async (req, res, next) => {
  try {
    if (!canUserImport(req)) {
      return res.status(403).json({ message: 'You do not have permission to import data. Please request access from an Admin.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No Excel or CSV file uploaded.' });
    }

    const pool = await getPool();

    // Fetch existing users and projects for cross-reference validation
    const existingUsersRes = await pool.query('SELECT user_id, email, full_name FROM Users');
    const existingProjectsRes = await pool.query('SELECT project_id, project_name FROM Projects');

    const userEmailMap = new Map();
    existingUsersRes.rows.forEach(u => userEmailMap.set(u.email.toLowerCase().trim(), u));

    const projectNameMap = new Map();
    existingProjectsRes.rows.forEach(p => projectNameMap.set(p.project_name.toLowerCase().trim(), p));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const validationResults = {
      users: [],
      projects: [],
      tasks: [],
      summary: {
        totalRows: 0,
        validRowsCount: 0,
        warningRowsCount: 0,
        errorRowsCount: 0,
        newUsersCount: 0,
        newProjectsCount: 0,
        newTasksCount: 0
      }
    };

    // Helper date parse & format YYYY-MM-DD
    const parseDateValue = (val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      if (typeof val === 'number') {
        // Excel serial date integer (days since 1900-01-01)
        const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(dateObj.getTime())) return dateObj.toISOString().slice(0, 10);
      }
      const str = String(val).trim();
      if (!str) return null;
      const parsed = new Date(str);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
      return null;
    };

    // ----------------------------------------
    // Validate Users Sheet
    // ----------------------------------------
    const usersSheet = workbook.getWorksheet('Users_Import') || workbook.worksheets[2];
    if (usersSheet) {
      usersSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        const fullName = String(row.getCell(1).value || '').trim();
        const email = String(row.getCell(2).value || '').trim();
        const role = String(row.getCell(3).value || 'user').trim().toLowerCase();
        const designation = String(row.getCell(4).value || '').trim();

        if (!fullName && !email) return; // Empty row skip

        validationResults.summary.totalRows++;
        const item = { rowNumber, fullName, email, role: role === 'admin' ? 'admin' : 'user', designation, status: 'VALID', message: 'Ready to import' };

        if (!fullName) {
          item.status = 'ERROR';
          item.message = 'Full Name is required';
        } else if (!email || !email.includes('@')) {
          item.status = 'ERROR';
          item.message = 'Valid Email is required';
        } else if (userEmailMap.has(email.toLowerCase())) {
          item.status = 'WARNING';
          item.message = 'User email already exists (Will link existing user)';
        } else {
          validationResults.summary.newUsersCount++;
        }

        if (item.status === 'ERROR') validationResults.summary.errorRowsCount++;
        else if (item.status === 'WARNING') validationResults.summary.warningRowsCount++;
        else validationResults.summary.validRowsCount++;

        validationResults.users.push(item);
      });
    }

    // ----------------------------------------
    // Validate Projects Sheet
    // ----------------------------------------
    const projectsSheet = workbook.getWorksheet('Projects_Import') || workbook.worksheets[1];
    if (projectsSheet) {
      projectsSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const projectName = String(row.getCell(1).value || '').trim();
        const description = String(row.getCell(2).value || '').trim();
        const parentProjectName = String(row.getCell(3).value || '').trim();
        const status = String(row.getCell(4).value || 'Active').trim();

        if (!projectName) return;

        validationResults.summary.totalRows++;
        const item = { rowNumber, projectName, description, parentProjectName, status, statusType: 'VALID', message: 'Ready to import' };

        if (projectNameMap.has(projectName.toLowerCase())) {
          item.statusType = 'WARNING';
          item.message = 'Project already exists (Will link existing project)';
        } else {
          validationResults.summary.newProjectsCount++;
        }

        if (item.statusType === 'ERROR') validationResults.summary.errorRowsCount++;
        else if (item.statusType === 'WARNING') validationResults.summary.warningRowsCount++;
        else validationResults.summary.validRowsCount++;

        validationResults.projects.push(item);
      });
    }

    // ----------------------------------------
    // Validate Tasks Sheet
    // ----------------------------------------
    const tasksSheet = workbook.getWorksheet('Tasks_Import') || workbook.worksheets[0];
    if (tasksSheet) {
      tasksSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const title = String(row.getCell(1).value || '').trim();
        const description = String(row.getCell(2).value || '').trim();
        const projectName = String(row.getCell(3).value || '').trim();
        const assignedEmail = String(row.getCell(4).value || '').trim();
        const status = String(row.getCell(5).value || 'To Do').trim();
        const priority = String(row.getCell(6).value || 'Medium').trim();
        const storyPoints = Number(row.getCell(7).value) || 1;
        const moduleName = String(row.getCell(8).value || 'General').trim();
        const startDate = parseDateValue(row.getCell(9).value);
        const dueDate = parseDateValue(row.getCell(10).value);
        const location = String(row.getCell(11).value || 'Offshore').trim();

        if (!title && !projectName) return;

        validationResults.summary.totalRows++;
        const item = {
          rowNumber,
          title,
          description,
          projectName,
          assignedEmail,
          status,
          priority,
          storyPoints,
          moduleName,
          startDate,
          dueDate,
          location,
          statusType: 'VALID',
          message: 'Ready to import'
        };

        if (!title) {
          item.statusType = 'ERROR';
          item.message = 'Task Title is required';
        } else if (!projectName) {
          item.statusType = 'ERROR';
          item.message = 'Project Name is required';
        } else {
          validationResults.summary.newTasksCount++;
        }

        if (item.statusType === 'ERROR') validationResults.summary.errorRowsCount++;
        else if (item.statusType === 'WARNING') validationResults.summary.warningRowsCount++;
        else validationResults.summary.validRowsCount++;

        validationResults.tasks.push(item);
      });
    }

    res.json({
      success: true,
      data: validationResults
    });
  } catch (error) {
    logger.error('Bulk Import Validation Failed', { error: error.message });
    res.status(400).json({ message: 'Failed to process Excel file. Please ensure it follows the standard template format.', detail: error.message });
  }
});

// ==========================================
// 3. POST /api/import/commit - Commit Valid Data to DB
// ==========================================
router.post('/commit', async (req, res, next) => {
  const client = await (await getPool()).connect();
  try {
    if (!canUserImport(req)) {
      return res.status(403).json({ message: 'Forbidden. Import permissions required.' });
    }

    const { users = [], projects = [], tasks = [] } = req.body;

    await client.query('BEGIN');

    let usersCreated = 0;
    let projectsCreated = 0;
    let tasksCreated = 0;

    const defaultHashedPassword = await bcrypt.hash('TtlUser@2026', 10);

    // 1. Process Users
    const userEmailToIdMap = new Map();
    const existingUsers = await client.query('SELECT user_id, email FROM Users');
    existingUsers.rows.forEach((u) => userEmailToIdMap.set(u.email.toLowerCase().trim(), u.user_id));

    // Get default role IDs
    const rolesRes = await client.query('SELECT role_id, role_name FROM Roles');
    const roleMap = new Map();
    rolesRes.rows.forEach((r) => roleMap.set(r.role_name.toLowerCase(), r.role_id));
    const defaultUserRoleId = roleMap.get('user') || 2;
    const adminRoleId = roleMap.get('admin') || 1;

    for (const u of users) {
      if (u.status === 'ERROR' || !u.fullName || !u.email) continue;
      const lowerEmail = u.email.toLowerCase().trim();

      if (!userEmailToIdMap.has(lowerEmail)) {
        const targetRoleId = u.role === 'admin' ? adminRoleId : defaultUserRoleId;
        const ins = await client.query(
          `INSERT INTO Users (full_name, email, password, role_id, designation, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'Active', NOW(), NOW())
           RETURNING user_id`,
          [u.fullName, lowerEmail, defaultHashedPassword, targetRoleId, u.designation || 'Team Member']
        );
        userEmailToIdMap.set(lowerEmail, ins.rows[0].user_id);
        usersCreated++;
      }
    }

    // 2. Process Projects
    const projectNameToIdMap = new Map();
    const existingProjects = await client.query('SELECT project_id, project_name FROM Projects');
    existingProjects.rows.forEach((p) => projectNameToIdMap.set(p.project_name.toLowerCase().trim(), p.project_id));

    for (const p of projects) {
      if (p.statusType === 'ERROR' || !p.projectName) continue;
      const lowerProjName = p.projectName.toLowerCase().trim();

      if (!projectNameToIdMap.has(lowerProjName)) {
        let parentId = null;
        if (p.parentProjectName) {
          const parentKey = p.parentProjectName.toLowerCase().trim();
          if (projectNameToIdMap.has(parentKey)) {
            parentId = projectNameToIdMap.get(parentKey);
          } else {
            // Create Parent Project if missing
            const parentIns = await client.query(
              `INSERT INTO Projects (project_name, description, status, created_at, updated_at)
               VALUES ($1, $2, 'Active', NOW(), NOW())
               RETURNING project_id`,
              [p.parentProjectName, 'Parent Project Space']
            );
            parentId = parentIns.rows[0].project_id;
            projectNameToIdMap.set(parentKey, parentId);
            projectsCreated++;
          }
        }

        const ins = await client.query(
          `INSERT INTO Projects (project_name, description, parent_project_id, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           RETURNING project_id`,
          [p.projectName, p.description || '', parentId, p.status || 'Active']
        );
        projectNameToIdMap.set(lowerProjName, ins.rows[0].project_id);
        projectsCreated++;
      }
    }

    // 3. Process Tasks
    for (const t of tasks) {
      if (t.statusType === 'ERROR' || !t.title || !t.projectName) continue;
      const lowerProjKey = t.projectName.toLowerCase().trim();

      let targetProjectId = projectNameToIdMap.get(lowerProjKey);
      if (!targetProjectId) {
        // Auto-create project if missing
        const insP = await client.query(
          `INSERT INTO Projects (project_name, description, status, created_at, updated_at)
           VALUES ($1, 'Auto-created during bulk import', 'Active', NOW(), NOW())
           RETURNING project_id`,
          [t.projectName]
        );
        targetProjectId = insP.rows[0].project_id;
        projectNameToIdMap.set(lowerProjKey, targetProjectId);
        projectsCreated++;
      }

      let assignedUserId = null;
      if (t.assignedEmail) {
        assignedUserId = userEmailToIdMap.get(t.assignedEmail.toLowerCase().trim()) || null;
      }

      const validStatuses = ['Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Blocked', 'Completed'];
      const validPriorities = ['Low', 'Medium', 'High', 'Critical'];

      const status = validStatuses.includes(t.status) ? t.status : 'To Do';
      const priority = validPriorities.includes(t.priority) ? t.priority : 'Medium';

      await client.query(
        `INSERT INTO Tasks (
          task_title, description, project_id, assigned_user_id,
          status, priority, story_points, module_name,
          start_date, due_date, location, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          t.title,
          t.description || '',
          targetProjectId,
          assignedUserId,
          status,
          priority,
          t.storyPoints || 1,
          t.moduleName || 'General',
          t.startDate || null,
          t.dueDate || null,
          t.location || 'Offshore'
        ]
      );
      tasksCreated++;
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Bulk Data Import completed successfully!',
      summary: {
        usersCreated,
        projectsCreated,
        tasksCreated
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Commit Bulk Import Failed', { error: error.message });
    res.status(500).json({ message: 'Failed to commit import data.', detail: error.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 4. PUT /api/import/permission/:userId - Admin toggle user import access
// ==========================================
router.put('/permission/:userId', async (req, res, next) => {
  try {
    if (req.user?.role_name !== 'admin') {
      return res.status(403).json({ message: 'Only Admins can grant or revoke import permissions.' });
    }

    const { userId } = req.params;
    const { can_import_excel } = req.body;

    const pool = await getPool();
    await pool.query('UPDATE Users SET can_import_excel = $1 WHERE user_id = $2', [Boolean(can_import_excel), userId]);

    res.json({ success: true, message: `Updated import permission for user #${userId}` });
  } catch (error) {
    next(error);
  }
});

export default router;
