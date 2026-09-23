import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import { getPool, sql } from '../config/db.js';

dotenv.config();

const DEFAULT_TRACKER_FILE = '/Users/apple/Downloads/Daily tracker (1).xlsx';
const TARGET_DB = process.env.IMPORT_TARGET_DB || 'ZiraAgileDev2';
const DRY_RUN = process.argv.includes('--dry-run');
const trackerFile =
  process.env.DAILY_TRACKER_FILE ||
  process.argv.find((arg) => arg.endsWith('.xlsx') || arg.endsWith('.xls')) ||
  DEFAULT_TRACKER_FILE;

const adminPassword = process.env.KNOWN_ADMIN_PASSWORD;
const userPassword = process.env.KNOWN_USER_PASSWORD;

const knownUsers = [
  {
    fullName: 'Pattanaik, Jayant',
    email: 'jayant.pattanaik@ttl.com',
    role: 'admin',
    department: 'Delivery',
    designation: 'Project Director',
    aliases: ['Jayant Pattanaik', 'pattanaik, Jayant']
  },
  canonical('Bhise, Kuldeep', 'kuldeep.bhise@ttl.com', 'Sr. Tech Lead', ['Kuldeep Bhise']),
  canonical('Abdul Hameed, Ayesha', 'ayesha.abdul.hameed@ttl.com', 'Senior Developer - PLM', ['Ayesha Abdul Hameed', 'Ayesha']),
  canonical('Deshmukh, Varsha', 'varsha.deshmukh@ttl.com', 'Sr. Developer', ['Varsha']),
  canonical('Dhumal, Sharshi', 'sharshi.dhumal@ttl.com', 'Sr. Developer', ['Shashi', 'Sharshi']),
  canonical('Kadam, Vishal', 'vishal.kadam@ttl.com', 'Sr. Technical Consultant', ['Vishal']),
  canonical('Pansambal, Somnath', 'somnath.pansambal@ttl.com', 'Team Lead', ['Somnath']),
  canonical('Patil, Harshvardhan', 'harshvardhan.patil@ttl.com', 'Sr. Developer', ['Harshvardhan Patil', 'Harshvardhan', 'harsh', 'Harsh']),
  canonical('Tiwari, Gaurav', 'gaurav.tiwari@ttl.com', 'Team Lead', ['Gaurav', 'Gourav']),
  canonical('Joshi, Omkar', 'omkar.joshi@ttl.com', 'Sr. Functional Consultant', ['Omkar']),
  canonical('C. Puneeth', 'c.puneeth@ttl.com', 'Technical Lead', ['Puneeth']),
  canonical('Chandekar, Vivek', 'vivek.chandekar@ttl.com', 'Tech Lead', ['Vivek']),
  canonical('Dhatrak, Swati', 'swati.dhatrak@ttl.com', 'Engineer', ['Swati', 'swati']),
  canonical('Jain, DARSHNA', 'darshna.jain@ttl.com', 'Sr. Developer', ['Jain, Darshna', 'Darshna']),
  canonical('Khodiyar, Pratik', 'pratik.khodiyar@ttl.com', 'Developer', ['Pratik Khodiyar', 'Pratik']),
  canonical('kumar, vipin', 'vipin.kumar@ttl.com', 'Team Lead', ['Kumar, Vipin', 'Vipin']),
  canonical('M, Chaitanyasai', 'chaitanyasai.m@ttl.com', 'Developer', ['Chaitanyasai', 'Chaithanyasai', 'Chaithanya']),
  canonical('Hedaoo, Piyush', 'piyush.hedaoo@ttl.com', 'Sr. Tech Lead', ['Piyush Hedaoo', 'Piyush']),
  canonical('Baviskar, Vilas', 'vilas.baviskar@ttl.com', 'Technical Lead - Teamcenter', ['Vilas Baviskar', 'Vilas']),
  canonical('Bhegade, Suraj', 'suraj.bhegade@ttl.com', 'Consultant', ['Suraj', 'Suraj B']),
  canonical('Devarapalli, Pranay', 'pranay.devarapalli@ttl.com', 'Sr. Developer', ['Pranay Devarapalli', 'Pranay']),
  canonical('Jain, Himanshu', 'himanshu.jain@ttl.com', 'Tech Lead', ['Himanshu Jain', 'Himanshu']),
  canonical('Khan, Nawaz', 'nawaz.khan@ttl.com', 'Sr. Developer', ['Nawaz Khan', 'Nawaz']),
  canonical('MISHRA, UNNAT', 'unnat.mishra@ttl.com', 'Solution Developer', ['Mishra, Unnat', 'Unnat Mishra']),
  canonical('Mane, Gangadhar', 'gangadhar.mane@ttl.com', 'Team Lead', ['Mane Gangadhar', 'Gangadhar']),
  canonical('Pawara, Nitesh', 'nitesh.pawara@ttl.com', 'Solution Developer', ['Nitesh Pawara', 'Nitesh']),
  canonical('Nair, Pranav', 'pranav.nair@ttl.com', 'Team Lead', ['Pranav']),
  canonical('Savant, Rajdeep', 'rajdeep.savant@ttl.com', 'Developer', ['Rajdeep']),
  canonical('Verma, Ekta', 'ekta.verma@ttl.com', 'Developer', ['Ekta']),
  canonical('Nandakumar, Nikhil', 'nikhil.nandakumar@ttl.com', 'Tech Lead', ['Nikhil']),
  canonical('Shimpi, Ashutosh', 'ashutosh.shimpi@ttl.com', 'Solution Developer', ['Ashutosh Shimpi', 'Ashutosh']),
  canonical('Poul, Sunil', 'sunil.poul@ttl.com', 'Tech Lead', ['Sunil Poul', 'Sunil']),
  canonical('Shelar, Bhau', 'bhau.shelar@ttl.com', 'Tech Lead', ['Bhau Shelar', 'Bhau']),
  canonical('Dukare, Shubham', 'shubham.dukare@ttl.com', 'Senior Solution Developer', ['Shubham Dukare', 'Shubham D', 'shubham D']),
  canonical('Kolekar, Poonam', 'poonam.kolekar@ttl.com', 'Developer', ['Poonam', 'poonam']),
  canonical('MOHANTY, SUBHAM', 'subham.mohanty@ttl.com', 'Solution Developer', ['Mohanty, Subham', 'subham mohanty', 'Subham', 'Subham Mohanty']),
  canonical('Yadav, Manish', 'manish.yadav@ttl.com', 'Tech Lead', ['Manish Yadav', 'Manish']),
  canonical('Gadale, Rushikesh', 'rushikesh.gadale@ttl.com', 'Sr. Developer', ['Rushikesh Gadkar', 'Rushikesh', 'Rushi']),
  canonical('Jawase, Krutika', 'krutika.jawase@ttl.com', 'Sr. Developer', ['Krutika Jawase', 'Krutika'])
];

const groupAliases = [
  ['Puneeth & Gaurav', ['C. Puneeth', 'Tiwari, Gaurav']],
  ['Shashi & Harshvardhan', ['Dhumal, Sharshi', 'Patil, Harshvardhan']],
  ['Shashi & Rushi', ['Dhumal, Sharshi', 'Gadale, Rushikesh']],
  ['Shashi & Somnath', ['Dhumal, Sharshi', 'Pansambal, Somnath']],
  ['Somnath & Nikhil', ['Pansambal, Somnath', 'Nandakumar, Nikhil']],
  ['Vishal & Gourav', ['Kadam, Vishal', 'Tiwari, Gaurav']],
  ['VivekSuraj', ['Chandekar, Vivek', 'Bhegade, Suraj']]
];

const statusMap = new Map([
  ['open', 'To Do'],
  ['wip', 'In Progress'],
  ['work in progress', 'In Progress'],
  ['in progress', 'In Progress'],
  ['on hold', 'Blocked'],
  ['hold', 'Blocked'],
  ['completed', 'Done'],
  ['complete', 'Done'],
  ['done', 'Done'],
  ['blocked', 'Blocked'],
  ['testing', 'Testing'],
  ['review', 'In Review'],
  ['cancelled', 'Done'],
  ['canceled', 'Done'],
  ['cancelled the requirement.', 'Done'],
  ['enhancement', 'Backlog']
]);

const invalidTaskRows = [];
const unassignedRows = [];
const normalizedStatusRows = [];
const sourceRemarkStats = [];

const monthIndexes = new Map(
  ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map((month, index) => [
    month,
    index
  ])
);

function canonical(fullName, email, designation, aliases = []) {
  return {
    fullName,
    email,
    role: 'user',
    department: 'Delivery',
    designation,
    aliases
  };
}

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function aliasKey(value) {
  return normalize(value).toLowerCase();
}

function rawCellText(cell) {
  if (!cell) return '';
  const value = cell.value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (value?.richText) return value.richText.map((part) => part.text || '').join('');
  if (value?.text) return value.text;
  return cell.text || String(value || '');
}

function splitNames(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/[\r\n]+/g, '/')
    .split(/\s*\/\s*|\s*,\s*|\s*&\s*/i)
    .map(normalize)
    .filter(Boolean)
    .filter((name) => !/^n\\?a$/i.test(name));
}

function slug(value) {
  return normalize(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 80);
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;

  const text = normalize(value);
  if (!text || /till date|expected|week|today/i.test(text)) return null;

  const iso = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));

  const local = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (local) {
    const year = Number(local[3].length === 2 ? `20${local[3]}` : local[3]);
    return new Date(Date.UTC(year, Number(local[2]) - 1, Number(local[1])));
  }

  return null;
}

function dateFromParts(day, month, year = '2026') {
  let parsedYear = Number(String(year).length === 2 ? `20${year}` : year);
  if (parsedYear > 2026) parsedYear = 2026;
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  if (parsedDay < 1 || parsedDay > 31 || parsedMonth < 1 || parsedMonth > 12) return null;

  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  if (
    Number.isNaN(date.valueOf()) ||
    date.getUTCFullYear() !== parsedYear ||
    date.getUTCMonth() !== parsedMonth - 1 ||
    date.getUTCDate() !== parsedDay
  ) {
    return null;
  }
  return date;
}

function inferNumericDateOrder(value) {
  const numericMatches = [...String(value || '').matchAll(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/g)];
  const monthFirstSignals = numericMatches.filter((match) => Number(match[1]) <= 12 && Number(match[2]) > 12).length;
  const dayFirstSignals = numericMatches.filter((match) => Number(match[1]) > 12 && Number(match[2]) <= 12).length;
  return monthFirstSignals > dayFirstSignals ? 'mdy' : 'dmy';
}

function parseInlineDate(token, preferredOrder = 'dmy') {
  const numeric = token.match(/(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?/);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    const year = numeric[3] || '2026';
    const usesMonthFirst =
      first <= 12 &&
      (second > 12 || (numeric[3]?.length === 4 && preferredOrder === 'mdy'));
    return usesMonthFirst
      ? dateFromParts(second, first, year)
      : dateFromParts(first, second, year);
  }

  const monthName = token.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/i);
  if (monthName) {
    const month = monthIndexes.get(monthName[2].slice(0, 3).toLowerCase()) + 1;
    return dateFromParts(monthName[1], month, '2026');
  }

  return null;
}

function cleanRemarkSegment(segment) {
  return normalize(
    segment
      .replace(/^[-–—>:\s()]+/, '')
      .replace(/^[-–—>:\s()]+/, '')
      .replace(/^\d+\)\s*/, '')
  );
}

function parseRemarkEntries(text, fallbackDate) {
  const value = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!value) return [];
  const preferredOrder = inferNumericDateOrder(value);

  const dateRegex =
    /(?:^|[\s(>-])((?:\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)|(?:\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*))/gi;
  const matches = [...value.matchAll(dateRegex)].map((match) => ({
    dateToken: match[1],
    index: match.index + match[0].indexOf(match[1]),
    parsedDate: parseInlineDate(match[1], preferredOrder)
  })).filter((match) => match.parsedDate);

  if (!matches.length) {
    return [
      {
        remarkDate: fallbackDate || new Date(Date.UTC(2026, 0, 1)),
        remarkText: cleanRemarkSegment(value)
      }
    ].filter((entry) => entry.remarkText);
  }

  const entries = [];
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const remarkDate = current.parsedDate || fallbackDate || new Date(Date.UTC(2026, 0, 1));
    const segment = value.slice(current.index + current.dateToken.length, next?.index ?? value.length);
    const remarkText = cleanRemarkSegment(segment);
    if (remarkText) {
      entries.push({ remarkDate, remarkText });
    }
  }

  return entries;
}

function excelDateValue(cell) {
  const value = cell?.value;
  if (value instanceof Date) return value;
  return rawCellText(cell);
}

function getHeaderMap(worksheet) {
  const headers = worksheet.getRow(1).values.slice(1).map(normalize);
  const findCol = (...patterns) => headers.findIndex((header) => patterns.some((pattern) => pattern.test(header))) + 1;

  return {
    resource: findCol(/^resource name$/i, /^resource$/i),
    project: findCol(/^project name/i, /^project name\/bu$/i, /^training module$/i),
    title: findCol(/^task name$/i),
    description: findCol(/^detail description$/i),
    dailyUpdate: findCol(/^daily update/i),
    startDate: findCol(/^start date$/i),
    endDate: findCol(/^end date$/i),
    status: findCol(/^status/i),
    remark: findCol(/^remark$/i),
    documentLinks: findCol(/^document links$/i)
  };
}

function buildAliasMap() {
  const aliasMap = new Map();
  for (const user of knownUsers) {
    for (const alias of [user.fullName, ...(user.aliases || [])]) {
      aliasMap.set(aliasKey(alias), user.fullName);
    }
  }
  for (const [alias, targetNames] of groupAliases) {
    aliasMap.set(aliasKey(alias), targetNames);
  }
  return aliasMap;
}

async function parseWorkbook(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const aliasMap = buildAliasMap();
  const projects = new Map();
  const tasks = [];
  const sheets = workbook.worksheets.filter((worksheet) => worksheet.name.trim().toLowerCase() !== 'details');

  for (const worksheet of sheets) {
    const columns = getHeaderMap(worksheet);
    let sheetRows = 0;

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      if (!row.hasValues) continue;

      const resourceRaw = columns.resource ? rawCellText(row.getCell(columns.resource)) : '';
      const projectName = normalize(columns.project ? rawCellText(row.getCell(columns.project)) : '') || worksheet.name.trim();
      const title = normalize(columns.title ? rawCellText(row.getCell(columns.title)) : '');
      const description = normalize(columns.description ? rawCellText(row.getCell(columns.description)) : '');
      const dailyUpdate = normalize(columns.dailyUpdate ? rawCellText(row.getCell(columns.dailyUpdate)) : '');
      const remark = normalize(columns.remark ? rawCellText(row.getCell(columns.remark)) : '');
      const documentLinks = normalize(columns.documentLinks ? rawCellText(row.getCell(columns.documentLinks)) : '');
      const statusRaw = normalize(columns.status ? rawCellText(row.getCell(columns.status)) : '') || 'Open';

      if (!resourceRaw && !projectName && !title) continue;
      sheetRows += 1;

      if (!title) {
        invalidTaskRows.push({ sheet: worksheet.name, rowNumber, resource: normalize(resourceRaw), projectName, statusRaw });
        continue;
      }

      const mappedUsers = [];
      const resourceNames = splitNames(resourceRaw);
      for (const resourceName of resourceNames) {
        const mapped = aliasMap.get(aliasKey(resourceName));
        const targetNames = Array.isArray(mapped) ? mapped : [mapped].filter(Boolean);

        for (const targetName of targetNames.filter(Boolean)) {
          mappedUsers.push(targetName);
        }
      }

      if (!mappedUsers.length) {
        unassignedRows.push({ sheet: worksheet.name, rowNumber, projectName, title });
      }

      const normalizedStatus = statusMap.get(statusRaw.toLowerCase()) || 'To Do';
      if (normalizedStatus !== statusRaw && !['Open', 'WIP', 'Completed', 'Complete', 'completed'].includes(statusRaw)) {
        normalizedStatusRows.push({ sheet: worksheet.name, rowNumber, title, statusRaw, normalizedStatus });
      }

      projects.set(projectName.toLowerCase(), projectName);
      const startDate = parseDate(excelDateValue(columns.startDate ? row.getCell(columns.startDate) : null));
      const endDate = parseDate(excelDateValue(columns.endDate ? row.getCell(columns.endDate) : null));
      const remarksSource = [
        dailyUpdate && { label: 'Daily Update', value: dailyUpdate },
        remark && { label: 'Remark', value: remark },
        documentLinks && { label: 'Document Links', value: documentLinks }
      ].filter(Boolean);
      const dailyRemarks = remarksSource.flatMap((source) =>
        parseRemarkEntries(source.value, startDate || endDate).map((entry) => ({
          ...entry,
          remarkText: `${source.label}: ${entry.remarkText}`
        }))
      );
      sourceRemarkStats.push({
        sheet: worksheet.name.trim(),
        rowNumber,
        title,
        remarkCount: dailyRemarks.length
      });

      const remarks = [
        dailyUpdate && `Daily Update:\n${dailyUpdate}`,
        remark && `Remark:\n${remark}`,
        documentLinks && `Document Links:\n${documentLinks}`,
        normalizedStatus !== statusRaw && `Original Excel Status: ${statusRaw}`,
        resourceRaw && `Original Resource: ${normalize(resourceRaw)}`,
        `Source Sheet: ${worksheet.name.trim()} Row ${rowNumber}`
      ]
        .filter(Boolean)
        .join('\n\n');

      tasks.push({
        sourceSheet: worksheet.name.trim(),
        sourceRow: rowNumber,
        title,
        description,
        projectName,
        assigneeName: mappedUsers[0] || null,
        memberNames: [...new Set(mappedUsers)],
        employeeName: normalize(resourceRaw) || null,
        status: normalizedStatus,
        priority: 'Medium',
        moduleName: worksheet.name.trim(),
        startDate,
        endDate,
        dailyRemarks,
        remarks
      });
    }

    if (!sheetRows) {
      invalidTaskRows.push({ sheet: worksheet.name, rowNumber: null, reason: 'No data rows found' });
    }
  }

  return {
    projects: [...projects.values()].sort((a, b) => a.localeCompare(b)),
    users: [...knownUsers],
    tasks
  };
}

async function ensureSafeTarget(pool) {
  const result = await pool.request().query('SELECT DB_NAME() AS database_name');
  const databaseName = result.recordset[0].database_name;
  if (databaseName !== TARGET_DB || process.env.DB_DATABASE !== TARGET_DB) {
    throw new Error(`Refusing import. Connected DB is ${databaseName}, expected ${TARGET_DB}.`);
  }
  if (!DRY_RUN && process.env.IMPORT_DAILY_TRACKER_CONFIRM !== TARGET_DB) {
    throw new Error(`Set IMPORT_DAILY_TRACKER_CONFIRM=${TARGET_DB} to import into ${TARGET_DB}.`);
  }
}

async function tableExists(transaction, tableName) {
  const result = await new sql.Request(transaction)
    .input('table_name', sql.NVarChar(128), tableName)
    .query("SELECT OBJECT_ID(N'dbo.' + @table_name, N'U') AS object_id");
  return Boolean(result.recordset[0].object_id);
}

async function clearExistingData(transaction) {
  const tables = [
    'Notifications',
    'TaskHistory',
    'TaskRemarks',
    'TaskComments',
    'ExcelImports',
    'ProjectMembers',
    'Tasks',
    'Projects',
    'Users',
    'Roles'
  ];

  for (const table of tables) {
    if (!(await tableExists(transaction, table))) continue;
    await new sql.Request(transaction).query(`DELETE FROM dbo.${table};`);
    await new sql.Request(transaction).query(`DBCC CHECKIDENT ('dbo.${table}', RESEED, 0);`);
  }
}

async function insertRoles(transaction) {
  await new sql.Request(transaction).query(`
    INSERT INTO Roles (role_name) VALUES ('admin'), ('user');
  `);
  const result = await new sql.Request(transaction).query('SELECT role_id, role_name FROM Roles');
  return Object.fromEntries(result.recordset.map((role) => [role.role_name, role.role_id]));
}

async function insertUsers(transaction, users, roleIds) {
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const userHash = await bcrypt.hash(userPassword, 12);
  const userIds = new Map();

  for (const user of users) {
    const result = await new sql.Request(transaction)
      .input('full_name', sql.NVarChar(150), user.fullName)
      .input('email', sql.NVarChar(255), user.email.toLowerCase())
      .input('password_hash', sql.NVarChar(255), user.role === 'admin' ? adminHash : userHash)
      .input('role_id', sql.Int, roleIds[user.role])
      .input('department', sql.NVarChar(100), user.department)
      .input('designation', sql.NVarChar(100), user.designation)
      .query(`
        INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
        OUTPUT INSERTED.user_id
        VALUES (@full_name, @email, @password_hash, @role_id, @department, @designation, 'Active')
      `);
    userIds.set(user.fullName, result.recordset[0].user_id);
  }

  return userIds;
}

async function insertProjects(transaction, projects, adminId) {
  const projectIds = new Map();
  for (const projectName of projects) {
    const result = await new sql.Request(transaction)
      .input('project_name', sql.NVarChar(160), projectName)
      .input('description', sql.NVarChar(sql.MAX), `Imported from Daily Tracker.`)
      .input('created_by', sql.Int, adminId)
      .query(`
        INSERT INTO Projects (project_name, description, status, created_by)
        OUTPUT INSERTED.project_id
        VALUES (@project_name, @description, 'Active', @created_by)
      `);
    projectIds.set(projectName, result.recordset[0].project_id);
  }
  return projectIds;
}

async function insertProjectMembers(transaction, tasks, projectIds, userIds) {
  const pairs = new Set();
  for (const task of tasks) {
    const projectId = projectIds.get(task.projectName);
    for (const memberName of task.memberNames) {
      const userId = userIds.get(memberName);
      if (!projectId || !userId) continue;
      pairs.add(`${projectId}:${userId}`);
    }
  }

  for (const pair of pairs) {
    const [projectId, userId] = pair.split(':').map(Number);
    await new sql.Request(transaction)
      .input('project_id', sql.Int, projectId)
      .input('user_id', sql.Int, userId)
      .input('role_in_project', sql.NVarChar(80), 'Contributor')
      .query(`
        INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
        VALUES (@project_id, @user_id, @role_in_project)
      `);
  }

  return pairs.size;
}

async function insertTasks(transaction, tasks, projectIds, userIds, adminId) {
  let inserted = 0;
  let insertedRemarks = 0;
  for (const task of tasks) {
    const assignedUserId = task.assigneeName ? userIds.get(task.assigneeName) : null;
    const projectId = projectIds.get(task.projectName);
    const result = await new sql.Request(transaction)
      .input('task_title', sql.NVarChar(255), task.title)
      .input('description', sql.NVarChar(sql.MAX), task.description || null)
      .input('assigned_user_id', sql.Int, assignedUserId || null)
      .input('employee_name', sql.NVarChar(150), task.employeeName)
      .input('status', sql.NVarChar(40), task.status)
      .input('priority', sql.NVarChar(40), task.priority)
      .input('project_id', sql.Int, projectId || null)
      .input('module_name', sql.NVarChar(120), task.moduleName)
      .input('start_date', sql.Date, task.startDate)
      .input('end_date', sql.Date, task.endDate)
      .input('due_date', sql.Date, task.endDate)
      .input('remarks', sql.NVarChar(sql.MAX), task.remarks || null)
      .input('created_by', sql.Int, adminId)
      .query(`
        INSERT INTO Tasks (
          task_title, description, assigned_user_id, employee_name, status, priority,
          project_id, module_name, start_date, end_date, due_date, remarks, created_by
        )
        OUTPUT INSERTED.task_id
        VALUES (
          @task_title, @description, @assigned_user_id, @employee_name, @status, @priority,
          @project_id, @module_name, @start_date, @end_date, @due_date, @remarks, @created_by
        )
      `);

    const taskId = result.recordset[0].task_id;
    const remarkUserId = assignedUserId || adminId;

    for (const remark of task.dailyRemarks) {
      await new sql.Request(transaction)
        .input('task_id', sql.Int, taskId)
        .input('user_id', sql.Int, remarkUserId)
        .input('remark_date', sql.Date, remark.remarkDate)
        .input('remark_text', sql.NVarChar(sql.MAX), remark.remarkText)
        .query(`
          INSERT INTO TaskRemarks (task_id, user_id, remark_date, remark_text)
          VALUES (@task_id, @user_id, @remark_date, @remark_text)
        `);
      insertedRemarks += 1;
    }

    await new sql.Request(transaction)
      .input('task_id', sql.Int, taskId)
      .input('changed_by', sql.Int, adminId)
      .input('new_status', sql.NVarChar(40), task.status)
      .input('new_priority', sql.NVarChar(40), task.priority)
      .input('change_description', sql.NVarChar(sql.MAX), `Imported from ${task.sourceSheet} row ${task.sourceRow}`)
      .query(`
        INSERT INTO TaskHistory (task_id, changed_by, new_status, new_priority, change_description)
        VALUES (@task_id, @changed_by, @new_status, @new_priority, @change_description)
      `);

    inserted += 1;
  }
  return { insertedTasks: inserted, insertedRemarks };
}

async function insertImportLog(transaction, adminId, totalRows, insertedRows) {
  await new sql.Request(transaction)
    .input('file_name', sql.NVarChar(255), trackerFile)
    .input('imported_by', sql.Int, adminId)
    .input('total_rows', sql.Int, totalRows)
    .input('success_rows', sql.Int, insertedRows)
    .input('failed_rows', sql.Int, invalidTaskRows.length)
    .query(`
      INSERT INTO ExcelImports (file_name, imported_by, total_rows, success_rows, failed_rows)
      VALUES (@file_name, @imported_by, @total_rows, @success_rows, @failed_rows)
    `);
}

async function main() {
  const parsed = await parseWorkbook(trackerFile);
  const remarksFromExcel = parsed.tasks.reduce((sum, task) => sum + task.dailyRemarks.length, 0);
  const report = {
    file: trackerFile,
    targetDb: TARGET_DB,
    dryRun: DRY_RUN,
    users: parsed.users.length,
    knownUsers: knownUsers.length,
    extraUsers: parsed.users.length - knownUsers.length,
    projects: parsed.projects.length,
    validTasks: parsed.tasks.length,
    dateWiseRemarks: remarksFromExcel,
    skippedRowsMissingTaskTitle: invalidTaskRows.length,
    unassignedRows: unassignedRows.length,
    normalizedStatusRows: normalizedStatusRows.length
  };
  console.table(report);

  if (invalidTaskRows.length) {
    console.log('Skipped rows missing task title:', invalidTaskRows);
  }
  if (normalizedStatusRows.length) {
    console.log('Normalized non-standard statuses:', normalizedStatusRows);
  }
  if (unassignedRows.length) {
    console.log('Rows imported without assignee:', unassignedRows);
  }

  const pool = await getPool();
  await ensureSafeTarget(pool);

  if (DRY_RUN) {
    await pool.close();
    return;
  }

  if (!adminPassword || !userPassword) {
    throw new Error('Set KNOWN_ADMIN_PASSWORD and KNOWN_USER_PASSWORD before importing users.');
  }

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    await clearExistingData(transaction);
    const roleIds = await insertRoles(transaction);
    const userIds = await insertUsers(transaction, parsed.users, roleIds);
    const adminId = userIds.get('Pattanaik, Jayant');
    const projectIds = await insertProjects(transaction, parsed.projects, adminId);
    const projectMemberCount = await insertProjectMembers(transaction, parsed.tasks, projectIds, userIds);
    const { insertedTasks, insertedRemarks } = await insertTasks(transaction, parsed.tasks, projectIds, userIds, adminId);
    await insertImportLog(transaction, adminId, parsed.tasks.length + invalidTaskRows.length, insertedTasks);
    await transaction.commit();

    console.table({
      imported_users: parsed.users.length,
      imported_projects: parsed.projects.length,
      imported_project_members: projectMemberCount,
      imported_tasks: insertedTasks,
      imported_date_wise_remarks: insertedRemarks,
      skipped_rows: invalidTaskRows.length
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error('Daily tracker import failed.');
  console.error(error);
  process.exit(1);
});
