// import ExcelJS from 'exceljs';
// import { getPool, sql } from '../config/db.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// export const exportTasks = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const request = pool.request();
//   const where = buildReportWhere(req, request);

//   const result = await request.query(`
//     SELECT t.task_id, t.task_title, t.description, COALESCE(u.full_name, t.employee_name) AS assigned_user,
//            t.employee_name, t.status, t.priority, COALESCE(p.project_name, '') AS project_name,
//            t.module_name, t.start_date, t.end_date, t.due_date, t.onsite_offshore,
//            CONCAT_WS(CHAR(10) + '---' + CHAR(10),
//              NULLIF(CAST(t.remarks AS NVARCHAR(MAX)), ''),
//              (
//                SELECT STRING_AGG(CAST(r.remark_date AS VARCHAR(10)) + ': ' + CAST(r.remark_text AS NVARCHAR(MAX)), CHAR(10)) WITHIN GROUP (ORDER BY r.remark_date DESC, r.created_at DESC)
//                FROM TaskRemarks r
//                WHERE r.task_id = t.task_id
//              )
//            ) AS remarks,
//            creator.full_name AS created_by_name, t.created_at, t.updated_at
//     FROM Tasks t
//     LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//     LEFT JOIN Users creator ON creator.user_id = t.created_by
//     LEFT JOIN Projects p ON p.project_id = t.project_id
//     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
//     ORDER BY t.created_at DESC
//   `);

//   const tasks = result.recordset;
//   const workbook = new ExcelJS.Workbook();
//   workbook.creator = 'Zira Agile';
//   workbook.created = new Date();

//   addTaskSheet(workbook, tasks);
//   addSummarySheet(workbook, 'Status Summary', tasks, (task) => task.status || 'Unassigned');
//   addSummarySheet(workbook, 'Priority Summary', tasks, (task) => task.priority || 'Unassigned');
//   addSummarySheet(workbook, 'Project Summary', tasks, (task) => task.project_name || 'Unassigned');
//   addSummarySheet(workbook, 'User Summary', tasks, (task) => task.assigned_user || task.employee_name || 'Unassigned');
//   addSummarySheet(workbook, 'Date Summary', tasks, (task) => formatDate(task.due_date) || 'No Due Date');

//   const fileName = `task-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
//   res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//   await workbook.xlsx.write(res);
//   res.end();
// });

// const addTaskSheet = (workbook, tasks) => {
//   const sheet = workbook.addWorksheet('Tasks');
//   sheet.columns = [
//     { header: 'Task ID', key: 'task_id', width: 12 },
//     { header: 'Task Title', key: 'task_title', width: 34 },
//     { header: 'Description', key: 'description', width: 40 },
//     { header: 'Assigned User', key: 'assigned_user', width: 24 },
//     { header: 'Employee Name', key: 'employee_name', width: 24 },
//     { header: 'Status', key: 'status', width: 16 },
//     { header: 'Priority', key: 'priority', width: 14 },
//     { header: 'Project', key: 'project_name', width: 22 },
//     { header: 'Module', key: 'module_name', width: 20 },
//     { header: 'Start Date', key: 'start_date', width: 14 },
//     { header: 'End Date', key: 'end_date', width: 14 },
//     { header: 'Due Date', key: 'due_date', width: 14 },
//     { header: 'Onsite/Offshore', key: 'onsite_offshore', width: 18 },
//     { header: 'Remarks', key: 'remarks', width: 40 },
//     { header: 'Created By', key: 'created_by_name', width: 22 },
//     { header: 'Created At', key: 'created_at', width: 22 },
//     { header: 'Updated At', key: 'updated_at', width: 22 }
//   ];

//   tasks.forEach((task) => sheet.addRow(task));
//   sheet.getColumn('remarks').alignment = { wrapText: true, vertical: 'top' };
//   sheet.getColumn('description').alignment = { wrapText: true, vertical: 'top' };
//   sheet.getColumn('task_title').alignment = { wrapText: true, vertical: 'top' };
//   styleHeader(sheet);
// };

// const addSummarySheet = (workbook, sheetName, tasks, keySelector) => {
//   const counts = tasks.reduce((acc, task) => {
//     const key = keySelector(task);
//     acc[key] = (acc[key] || 0) + 1;
//     return acc;
//   }, {});

//   const sheet = workbook.addWorksheet(sheetName);
//   sheet.columns = [
//     { header: 'Name', key: 'name', width: 34 },
//     { header: 'Task Count', key: 'value', width: 16 }
//   ];
//   Object.entries(counts).forEach(([name, value]) => sheet.addRow({ name, value }));
//   styleHeader(sheet);
// };

// const styleHeader = (sheet) => {
//   sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//   sheet.getRow(1).fill = {
//     type: 'pattern',
//     pattern: 'solid',
//     fgColor: { argb: 'FF172033' }
//   };
// };

// const buildReportWhere = (req, request) => {
//   const where = [];
//   const q = req.query;

//   if (req.user.role_name !== 'admin') {
//     request.input('current_user_id', sql.Int, req.user.user_id);
//     where.push('t.assigned_user_id = @current_user_id');
//   } else if (q.user_id) {
//     request.input('user_id', sql.Int, q.user_id);
//     where.push('t.assigned_user_id = @user_id');
//   }

//   if (q.status) {
//     request.input('status', sql.NVarChar(40), q.status);
//     where.push('t.status = @status');
//   }
//   if (q.priority) {
//     request.input('priority', sql.NVarChar(40), q.priority);
//     where.push('t.priority = @priority');
//   }
//   if (q.project_id) {
//     request.input('project_id', sql.Int, q.project_id);
//     where.push('t.project_id = @project_id');
//   }
//   if (q.module) {
//     request.input('module_name', sql.NVarChar(120), q.module);
//     where.push('t.module_name = @module_name');
//   }
//   if (q.onsite_offshore) {
//     request.input('onsite_offshore', sql.NVarChar(30), q.onsite_offshore);
//     where.push('t.onsite_offshore = @onsite_offshore');
//   }
//   if (q.date_from) {
//     request.input('date_from', sql.Date, new Date(q.date_from));
//     where.push('t.due_date >= @date_from');
//   }
//   if (q.date_to) {
//     request.input('date_to', sql.Date, new Date(q.date_to));
//     where.push('t.due_date <= @date_to');
//   }

//   return where;
// };

// const formatDate = (value) => {
//   if (!value) return '';
//   return new Date(value).toISOString().slice(0, 10);
// };



import ExcelJS from 'exceljs';
import { getPool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const exportTasks = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const params = [];
  const where = buildReportWhere(req, params);

  const result = await pool.query(
    `
      SELECT t.task_id, t.task_title, t.description, COALESCE(u.full_name, t.employee_name) AS assigned_user,
             t.employee_name, t.status, t.priority, COALESCE(p.project_name, '') AS project_name,
             t.module_name, t.start_date, t.end_date, t.due_date, t.onsite_offshore,
             CONCAT_WS(E'\n---\n',
               NULLIF(t.remarks, ''),
               (
                 SELECT STRING_AGG(r.remark_date::text || ': ' || r.remark_text, E'\n' ORDER BY r.remark_date DESC, r.created_at DESC)
                 FROM TaskRemarks r
                 WHERE r.task_id = t.task_id
               )
             ) AS remarks,
             creator.full_name AS created_by_name, t.created_at, t.updated_at
      FROM Tasks t
      LEFT JOIN Users u ON u.user_id = t.assigned_user_id
      LEFT JOIN Users creator ON creator.user_id = t.created_by
      LEFT JOIN Projects p ON p.project_id = t.project_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY t.created_at DESC
    `,
    params
  );

  const tasks = result.rows;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Zira Agile';
  workbook.created = new Date();

  addTaskSheet(workbook, tasks);
  addSummarySheet(workbook, 'Status Summary', tasks, (task) => task.status || 'Unassigned');
  addSummarySheet(workbook, 'Priority Summary', tasks, (task) => task.priority || 'Unassigned');
  addSummarySheet(workbook, 'Project Summary', tasks, (task) => task.project_name || 'Unassigned');
  addSummarySheet(workbook, 'User Summary', tasks, (task) => task.assigned_user || task.employee_name || 'Unassigned');
  addSummarySheet(workbook, 'Date Summary', tasks, (task) => formatDate(task.due_date) || 'No Due Date');

  const fileName = `task-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
});

const addTaskSheet = (workbook, tasks) => {
  const sheet = workbook.addWorksheet('Tasks');
  sheet.columns = [
    { header: 'Task ID', key: 'task_id', width: 12 },
    { header: 'Task Title', key: 'task_title', width: 34 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Assigned User', key: 'assigned_user', width: 24 },
    { header: 'Employee Name', key: 'employee_name', width: 24 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Project', key: 'project_name', width: 22 },
    { header: 'Module', key: 'module_name', width: 20 },
    { header: 'Start Date', key: 'start_date', width: 14 },
    { header: 'End Date', key: 'end_date', width: 14 },
    { header: 'Due Date', key: 'due_date', width: 14 },
    { header: 'Onsite/Offshore', key: 'onsite_offshore', width: 18 },
    { header: 'Remarks', key: 'remarks', width: 40 },
    { header: 'Created By', key: 'created_by_name', width: 22 },
    { header: 'Created At', key: 'created_at', width: 22 },
    { header: 'Updated At', key: 'updated_at', width: 22 }
  ];

  tasks.forEach((task) => sheet.addRow(task));
  sheet.getColumn('remarks').alignment = { wrapText: true, vertical: 'top' };
  sheet.getColumn('description').alignment = { wrapText: true, vertical: 'top' };
  sheet.getColumn('task_title').alignment = { wrapText: true, vertical: 'top' };
  styleHeader(sheet);
};

const addSummarySheet = (workbook, sheetName, tasks, keySelector) => {
  const counts = tasks.reduce((acc, task) => {
    const key = keySelector(task);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = [
    { header: 'Name', key: 'name', width: 34 },
    { header: 'Task Count', key: 'value', width: 16 }
  ];
  Object.entries(counts).forEach(([name, value]) => sheet.addRow({ name, value }));
  styleHeader(sheet);
};

const styleHeader = (sheet) => {
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF172033' }
  };
};

const buildReportWhere = (req, params) => {
  const where = [];
  const q = req.query;

  if (req.user.role_name !== 'admin') {
    params.push(req.user.user_id);
    where.push(`t.assigned_user_id = $${params.length}`);
  } else if (q.user_id) {
    params.push(q.user_id);
    where.push(`t.assigned_user_id = $${params.length}`);
  }

  if (q.status) {
    params.push(q.status);
    where.push(`t.status = $${params.length}`);
  }
  if (q.priority) {
    params.push(q.priority);
    where.push(`t.priority = $${params.length}`);
  }
  if (q.project_id) {
    params.push(q.project_id);
    where.push(`t.project_id = $${params.length}`);
  }
  if (q.module) {
    params.push(q.module);
    where.push(`t.module_name = $${params.length}`);
  }
  if (q.onsite_offshore) {
    params.push(q.onsite_offshore);
    where.push(`t.onsite_offshore = $${params.length}`);
  }
  if (q.date_from) {
    params.push(new Date(q.date_from));
    where.push(`t.due_date >= $${params.length}`);
  }
  if (q.date_to) {
    params.push(new Date(q.date_to));
    where.push(`t.due_date <= $${params.length}`);
  }

  return where;
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};
