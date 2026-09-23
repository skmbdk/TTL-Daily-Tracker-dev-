// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
// import { getPool, sql } from '../config/db.js';

// dotenv.config();

// const adminPassword = process.env.KNOWN_ADMIN_PASSWORD || 'Jayant@12345';
// const userPassword = process.env.KNOWN_USER_PASSWORD || 'User@12345';

// const users = [
//   {
//     fullName: 'Pattanaik, Jayant',
//     email: 'jayant.pattanaik@ttl.com',
//     role: 'admin',
//     department: 'Delivery',
//     designation: 'Project Director',
//     aliases: ['Jayant Pattanaik', 'pattanaik, Jayant']
//   },
//   canonical('Bhise, Kuldeep', 'kuldeep.bhise@ttl.com', 'Sr. Tech Lead', ['Kuldeep Bhise']),
//   canonical('Abdul Hameed, Ayesha', 'ayesha.abdul.hameed@ttl.com', 'Sr. Developer', ['Ayesha Abdul Hameed', 'Ayesha']),
//   canonical('Deshmukh, Varsha', 'varsha.deshmukh@ttl.com', 'Sr. Developer', ['Varsha']),
//   canonical('Dhumal, Sharshi', 'sharshi.dhumal@ttl.com', 'Sr. Developer', ['Shashi', 'Sharshi']),
//   canonical('Kadam, Vishal', 'vishal.kadam@ttl.com', 'Sr. Technical Consultant', ['Vishal']),
//   canonical('Pansambal, Somnath', 'somnath.pansambal@ttl.com', 'Team Lead', ['Somnath']),
//   canonical('Patil, Harshvardhan', 'harshvardhan.patil@ttl.com', 'Sr. Developer', ['Harshvardhan Patil', 'harsh', 'Harsh']),
//   canonical('Tiwari, Gaurav', 'gaurav.tiwari@ttl.com', 'Team Lead', ['Gaurav', 'Gourav']),
//   canonical('Joshi, Omkar', 'omkar.joshi@ttl.com', 'Sr. Functional Consultant', ['Omkar']),
//   canonical('C. Puneeth', 'c.puneeth@ttl.com', 'Technical Lead', ['Puneeth']),
//   canonical('Chandekar, Vivek', 'vivek.chandekar@ttl.com', 'Tech Lead', ['Vivek']),
//   canonical('Dhatrak, Swati', 'swati.dhatrak@ttl.com', 'Engineer', ['Swati']),
//   canonical('Jain, Darshna', 'darshna.jain@ttl.com', 'Sr. Developer', ['Darshna']),
//   canonical('Khodiyar, Pratik', 'pratik.khodiyar@ttl.com', 'Developer', ['Pratik Khodiyar', 'Pratik']),
//   canonical('Kumar, Vipin', 'vipin.kumar@ttl.com', 'Team Lead', ['Vipin']),
//   canonical('M, Chaitanyasai', 'chaitanyasai.m@ttl.com', 'Developer', ['Chaitanyasai', 'Chaithanya']),
//   canonical('Hedaoo, Piyush', 'piyush.hedaoo@ttl.com', 'Sr. Tech Lead', ['Piyush Hedaoo', 'Piyush']),
//   canonical('Baviskar, Vilas', 'vilas.baviskar@ttl.com', 'Technical Lead', ['Vilas Baviskar', 'Vilas']),
//   canonical('Bhegade, Suraj', 'suraj.bhegade@ttl.com', 'Consultant', ['Suraj']),
//   canonical('Devarapalli, Pranay', 'pranay.devarapalli@ttl.com', 'Sr. Developer', ['Pranay Devarapalli', 'Pranay']),
//   canonical('Jain, Himanshu', 'himanshu.jain@ttl.com', 'Tech Lead', ['Himanshu Jain', 'Himanshu']),
//   canonical('Khan, Nawaz', 'nawaz.khan@ttl.com', 'Sr. Developer', ['Nawaz Khan', 'Nawaz']),
//   canonical('Mishra, Unnat', 'unnat.mishra@ttl.com', 'Solution Developer', ['Unnat Mishra']),
//   canonical('Mane, Gangadhar', 'gangadhar.mane@ttl.com', 'Team Lead', ['Mane Gangadhar', 'Gangadhar']),
//   canonical('Pawara, Nitesh', 'nitesh.pawara@ttl.com', 'Solution Developer', ['Nitesh Pawara', 'Nitesh']),
//   canonical('Nair, Pranav', 'pranav.nair@ttl.com', 'Team Lead', ['Pranav']),
//   canonical('Savant, Rajdeep', 'rajdeep.savant@ttl.com', 'Developer', ['Rajdeep']),
//   canonical('Verma, Ekta', 'ekta.verma@ttl.com', 'Developer', ['Ekta']),
//   canonical('Nandakumar, Nikhil', 'nikhil.nandakumar@ttl.com', 'Tech Lead', ['Nikhil']),
//   canonical('Shimpi, Ashutosh', 'ashutosh.shimpi@ttl.com', 'Solution Developer', ['Ashutosh Shimpi', 'Ashutosh']),
//   canonical('Poul, Sunil', 'sunil.poul@ttl.com', 'Tech Lead', ['Sunil Poul', 'Sunil']),
//   canonical('Shelar, Bhau', 'bhau.shelar@ttl.com', 'Tech Lead', ['Bhau Shelar', 'Bhau']),
//   canonical('Dukare, Shubham', 'shubham.dukare@ttl.com', 'Senior Solution Developer', ['Shubham Dukare', 'Shubham D']),
//   canonical('Kolekar, Poonam', 'poonam.kolekar@ttl.com', 'Developer', ['Poonam']),
//   canonical('Mohanty, Subham', 'subham.mohanty@ttl.com', 'Solution Developer', ['subham mohanty', 'Subham']),
//   canonical('Yadav, Manish', 'manish.yadav@ttl.com', 'Tech Lead', ['Manish Yadav', 'Manish']),
//   canonical('Gadale, Rushikesh', 'rushikesh.gadale@ttl.com', 'Sr. Developer', ['Rushikesh Gadkar', 'Rushikesh']),
//   canonical('Jawase, Krutika', 'krutika.jawase@ttl.com', 'Sr. Developer', ['Krutika Jawase', 'Krutika'])
// ];

// const groupAliases = [
//   group('Puneeth & Gaurav', ['C. Puneeth', 'Tiwari, Gaurav']),
//   group('Shashi & Harshvardhan', ['Dhumal, Sharshi', 'Patil, Harshvardhan']),
//   group('Shashi & Rushi', ['Dhumal, Sharshi', 'Gadale, Rushikesh']),
//   group('Shashi & Somnath', ['Dhumal, Sharshi', 'Pansambal, Somnath']),
//   group('Somnath & Nikhil', ['Pansambal, Somnath', 'Nandakumar, Nikhil']),
//   group('Vishal & Gourav', ['Kadam, Vishal', 'Tiwari, Gaurav']),
//   group('VivekSuraj', ['Chandekar, Vivek', 'Bhegade, Suraj'])
// ];

// const pool = await getPool();
// const transaction = new sql.Transaction(pool);
// await transaction.begin();

// try {
//   const roleIds = await getRoleIds(transaction);
//   const adminHash = await bcrypt.hash(adminPassword, 12);
//   const userHash = await bcrypt.hash(userPassword, 12);
//   const canonicalIds = new Map();
//   const canonicalNames = new Set(users.map((user) => user.fullName));

//   for (const user of users) {
//     const userId = await upsertUser(transaction, {
//       ...user,
//       roleId: roleIds[user.role],
//       passwordHash: user.role === 'admin' ? adminHash : userHash
//     });
//     canonicalIds.set(user.fullName, userId);
//   }

//   let remappedTasks = 0;
//   for (const user of users) {
//     const aliases = [user.fullName, ...(user.aliases || [])];
//     for (const alias of aliases) {
//       remappedTasks += await remapTasks(transaction, alias, user.fullName, canonicalIds.get(user.fullName));
//     }
//   }

//   let clonedGroupTasks = 0;
//   for (const item of groupAliases) {
//     const sourceTasks = await findTasksByEmployeeName(transaction, item.alias);
//     for (const sourceTask of sourceTasks) {
//       for (const targetName of item.targetNames) {
//         const targetUserId = canonicalIds.get(targetName);
//         if (!targetUserId) continue;
//         const cloned = await cloneTaskIfMissing(transaction, sourceTask, targetName, targetUserId);
//         if (cloned) clonedGroupTasks += 1;
//       }
//     }
//     await deleteTasksByEmployeeName(transaction, item.alias);
//   }

//   const deactivatedUsers = await deactivateNonCanonicalUsers(transaction, canonicalNames);
//   await transaction.commit();

//   console.log('Known user sync completed.');
//   console.table({
//     canonical_users: users.length,
//     remapped_tasks: remappedTasks,
//     cloned_group_tasks: clonedGroupTasks,
//     deactivated_non_canonical_users: deactivatedUsers
//   });
//   console.log(`Admin login: Pattanaik, Jayant / ${adminPassword}`);
//   console.log(`Normal user password: ${userPassword}`);
//   process.exit(0);
// } catch (error) {
//   await transaction.rollback();
//   console.error('Known user sync failed.');
//   console.error(error);
//   process.exit(1);
// }

// function canonical(fullName, email, designation, aliases = []) {
//   return {
//     fullName,
//     email,
//     role: 'user',
//     department: 'Delivery',
//     designation,
//     aliases
//   };
// }

// function group(alias, targetNames) {
//   return { alias, targetNames };
// }

// async function getRoleIds(transaction) {
//   const result = await new sql.Request(transaction).query('SELECT role_id, role_name FROM Roles');
//   return Object.fromEntries(result.recordset.map((role) => [role.role_name, role.role_id]));
// }

// async function upsertUser(transaction, user) {
//   const existing = await new sql.Request(transaction)
//     .input('email', sql.NVarChar(255), user.email.toLowerCase())
//     .input('full_name', sql.NVarChar(150), user.fullName.toLowerCase())
//     .query('SELECT TOP 1 user_id FROM Users WHERE LOWER(email) = @email OR LOWER(full_name) = @full_name');

//   if (existing.recordset.length) {
//     const userId = existing.recordset[0].user_id;
//     await new sql.Request(transaction)
//       .input('user_id', sql.Int, userId)
//       .input('full_name', sql.NVarChar(150), user.fullName)
//       .input('email', sql.NVarChar(255), user.email.toLowerCase())
//       .input('password_hash', sql.NVarChar(255), user.passwordHash)
//       .input('role_id', sql.Int, user.roleId)
//       .input('department', sql.NVarChar(100), user.department)
//       .input('designation', sql.NVarChar(100), user.designation)
//       .query(`
//         UPDATE Users
//         SET full_name = @full_name,
//             email = @email,
//             password_hash = @password_hash,
//             role_id = @role_id,
//             department = @department,
//             designation = @designation,
//             status = 'Active',
//             updated_at = SYSUTCDATETIME()
//         WHERE user_id = @user_id
//       `);
//     return userId;
//   }

//   const created = await new sql.Request(transaction)
//     .input('full_name', sql.NVarChar(150), user.fullName)
//     .input('email', sql.NVarChar(255), user.email.toLowerCase())
//     .input('password_hash', sql.NVarChar(255), user.passwordHash)
//     .input('role_id', sql.Int, user.roleId)
//     .input('department', sql.NVarChar(100), user.department)
//     .input('designation', sql.NVarChar(100), user.designation)
//     .query(`
//       INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
//       OUTPUT INSERTED.user_id
//       VALUES (@full_name, @email, @password_hash, @role_id, @department, @designation, 'Active')
//     `);
//   return created.recordset[0].user_id;
// }

// async function remapTasks(transaction, alias, canonicalName, canonicalUserId) {
//   const result = await new sql.Request(transaction)
//     .input('alias', sql.NVarChar(150), alias.toLowerCase())
//     .input('canonical_name', sql.NVarChar(150), canonicalName)
//     .input('canonical_user_id', sql.Int, canonicalUserId)
//     .query(`
//       UPDATE t
//       SET assigned_user_id = @canonical_user_id,
//           employee_name = @canonical_name,
//           updated_at = SYSUTCDATETIME()
//       FROM Tasks t
//       LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//       WHERE LOWER(t.employee_name) = @alias OR LOWER(u.full_name) = @alias
//     `);
//   return result.rowsAffected[0] || 0;
// }

// async function findTasksByEmployeeName(transaction, employeeName) {
//   const result = await new sql.Request(transaction)
//     .input('employee_name', sql.NVarChar(150), employeeName.toLowerCase())
//     .query(`
//       SELECT *
//       FROM Tasks
//       WHERE LOWER(employee_name) = @employee_name
//     `);
//   return result.recordset;
// }

// async function cloneTaskIfMissing(transaction, sourceTask, targetName, targetUserId) {
//   const exists = await new sql.Request(transaction)
//     .input('task_title', sql.NVarChar(255), sourceTask.task_title)
//     .input('employee_name', sql.NVarChar(150), targetName)
//     .input('project_id', sql.Int, sourceTask.project_id)
//     .input('module_name', sql.NVarChar(120), sourceTask.module_name)
//     .input('start_date', sql.Date, sourceTask.start_date)
//     .query(`
//       SELECT TOP 1 task_id
//       FROM Tasks
//       WHERE task_title = @task_title
//         AND employee_name = @employee_name
//         AND ((project_id IS NULL AND @project_id IS NULL) OR project_id = @project_id)
//         AND ((module_name IS NULL AND @module_name IS NULL) OR module_name = @module_name)
//         AND ((start_date IS NULL AND @start_date IS NULL) OR start_date = @start_date)
//     `);

//   if (exists.recordset.length) return false;

//   await new sql.Request(transaction)
//     .input('task_title', sql.NVarChar(255), sourceTask.task_title)
//     .input('description', sql.NVarChar(sql.MAX), sourceTask.description)
//     .input('assigned_user_id', sql.Int, targetUserId)
//     .input('employee_name', sql.NVarChar(150), targetName)
//     .input('status', sql.NVarChar(40), sourceTask.status)
//     .input('priority', sql.NVarChar(40), sourceTask.priority)
//     .input('project_id', sql.Int, sourceTask.project_id)
//     .input('module_name', sql.NVarChar(120), sourceTask.module_name)
//     .input('start_date', sql.Date, sourceTask.start_date)
//     .input('end_date', sql.Date, sourceTask.end_date)
//     .input('due_date', sql.Date, sourceTask.due_date)
//     .input('onsite_offshore', sql.NVarChar(30), sourceTask.onsite_offshore)
//     .input('remarks', sql.NVarChar(sql.MAX), sourceTask.remarks)
//     .input('created_by', sql.Int, sourceTask.created_by)
//     .query(`
//       INSERT INTO Tasks (
//         task_title, description, assigned_user_id, employee_name, status, priority,
//         project_id, module_name, start_date, end_date, due_date, onsite_offshore,
//         remarks, created_by, created_at, updated_at
//       )
//       VALUES (
//         @task_title, @description, @assigned_user_id, @employee_name, @status, @priority,
//         @project_id, @module_name, @start_date, @end_date, @due_date, @onsite_offshore,
//         @remarks, @created_by, SYSUTCDATETIME(), SYSUTCDATETIME()
//       )
//     `);

//   return true;
// }

// async function deleteTasksByEmployeeName(transaction, employeeName) {
//   await new sql.Request(transaction)
//     .input('employee_name', sql.NVarChar(150), employeeName.toLowerCase())
//     .query('DELETE FROM Tasks WHERE LOWER(employee_name) = @employee_name');
// }

// async function deactivateNonCanonicalUsers(transaction, canonicalNames) {
//   const request = new sql.Request(transaction);
//   const placeholders = [];

//   [...canonicalNames].forEach((name, index) => {
//     const key = `name${index}`;
//     placeholders.push(`@${key}`);
//     request.input(key, sql.NVarChar(150), name);
//   });

//   const result = await request.query(`
//     UPDATE Users
//     SET status = 'Inactive', updated_at = SYSUTCDATETIME()
//     WHERE full_name NOT IN (${placeholders.join(', ')})
//   `);

//   return result.rowsAffected[0] || 0;
// }


import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';

dotenv.config();

const adminPassword = process.env.KNOWN_ADMIN_PASSWORD || 'Jayant@12345';
const userPassword = process.env.KNOWN_USER_PASSWORD || 'User@12345';

const users = [
  {
    fullName: 'Pattanaik, Jayant',
    email: 'jayant.pattanaik@ttl.com',
    role: 'admin',
    department: 'Delivery',
    designation: 'Project Director',
    aliases: ['Jayant Pattanaik', 'pattanaik, Jayant']
  },
  canonical('Bhise, Kuldeep', 'kuldeep.bhise@ttl.com', 'Sr. Tech Lead', ['Kuldeep Bhise']),
  canonical('Abdul Hameed, Ayesha', 'ayesha.abdul.hameed@ttl.com', 'Sr. Developer', ['Ayesha Abdul Hameed', 'Ayesha']),
  canonical('Deshmukh, Varsha', 'varsha.deshmukh@ttl.com', 'Sr. Developer', ['Varsha']),
  canonical('Dhumal, Shashi', 'shashi.dhumal@ttl.com', 'Sr. Developer', ['Dhumal, Sharshi', 'Shashi', 'Sharshi']),
  canonical('Kadam, Vishal', 'vishal.kadam@ttl.com', 'Sr. Technical Consultant', ['Vishal']),
  canonical('Pansambal, Somnath', 'somnath.pansambal@ttl.com', 'Team Lead', ['Somnath']),
  canonical('Patil, Harshvardhan', 'harshvardhan.patil@ttl.com', 'Sr. Developer', ['Harshvardhan Patil', 'harsh', 'Harsh']),
  canonical('Tiwari, Gaurav', 'gaurav.tiwari@ttl.com', 'Team Lead', ['Gaurav', 'Gourav']),
  canonical('Joshi, Omkar', 'omkar.joshi@ttl.com', 'Sr. Functional Consultant', ['Omkar']),
  canonical('C. Puneeth', 'c.puneeth@ttl.com', 'Technical Lead', ['Puneeth']),
  canonical('Chandekar, Vivek', 'vivek.chandekar@ttl.com', 'Tech Lead', ['Vivek']),
  canonical('Dhatrak, Swati', 'swati.dhatrak@ttl.com', 'Engineer', ['Swati']),
  canonical('Jain, Darshna', 'darshna.jain@ttl.com', 'Sr. Developer', ['Darshna']),
  canonical('Khodiyar, Pratik', 'pratik.khodiyar@ttl.com', 'Developer', ['Pratik Khodiyar', 'Pratik']),
  canonical('Kumar, Vipin', 'vipin.kumar@ttl.com', 'Team Lead', ['Vipin']),
  canonical('M, Chaitanyasai', 'chaitanyasai.m@ttl.com', 'Developer', ['Chaitanyasai', 'Chaithanya']),
  canonical('Hedaoo, Piyush', 'piyush.hedaoo@ttl.com', 'Sr. Tech Lead', ['Piyush Hedaoo', 'Piyush']),
  canonical('Baviskar, Vilas', 'vilas.baviskar@ttl.com', 'Technical Lead', ['Vilas Baviskar', 'Vilas']),
  canonical('Bhegade, Suraj', 'suraj.bhegade@ttl.com', 'Consultant', ['Suraj']),
  canonical('Devarapalli, Pranay', 'pranay.devarapalli@ttl.com', 'Sr. Developer', ['Pranay Devarapalli', 'Pranay']),
  canonical('Jain, Himanshu', 'himanshu.jain@ttl.com', 'Tech Lead', ['Himanshu Jain', 'Himanshu']),
  canonical('Khan, Nawaz', 'nawaz.khan@ttl.com', 'Sr. Developer', ['Nawaz Khan', 'Nawaz']),
  canonical('Mishra, Unnat', 'unnat.mishra@ttl.com', 'Solution Developer', ['Unnat Mishra']),
  canonical('Mane, Gangadhar', 'gangadhar.mane@ttl.com', 'Team Lead', ['Mane Gangadhar', 'Gangadhar']),
  canonical('Pawara, Nitesh', 'nitesh.pawara@ttl.com', 'Solution Developer', ['Nitesh Pawara', 'Nitesh']),
  canonical('Nair, Pranav', 'pranav.nair@ttl.com', 'Team Lead', ['Pranav']),
  canonical('Savant, Rajdeep', 'rajdeep.savant@ttl.com', 'Developer', ['Rajdeep']),
  canonical('Verma, Ekta', 'ekta.verma@ttl.com', 'Developer', ['Ekta']),
  canonical('Nandanwankar, Nikhil', 'nikhil.Nandanwankar@ttl.com', 'Tech Lead', ['Nikhil']),
  canonical('Shimpi, Ashutosh', 'ashutosh.shimpi@ttl.com', 'Solution Developer', ['Ashutosh Shimpi', 'Ashutosh']),
  canonical('Poul, Sunil', 'sunil.poul@ttl.com', 'Tech Lead', ['Sunil Poul', 'Sunil']),
  canonical('Shelar, Bhau', 'bhau.shelar@ttl.com', 'Tech Lead', ['Bhau Shelar', 'Bhau']),
  canonical('Dukare, Shubham', 'shubham.dukare@ttl.com', 'Senior Solution Developer', ['Shubham Dukare', 'Shubham D']),
  canonical('Kolekar, Poonam', 'poonam.kolekar@ttl.com', 'Developer', ['Poonam']),
  canonical('Mohanty, Subham', 'subham.mohanty@ttl.com', 'Solution Developer', ['subham mohanty', 'Subham']),
  canonical('Yadav, Manish', 'manish.yadav@ttl.com', 'Tech Lead', ['Manish Yadav', 'Manish']),
  canonical('Gadkar, Rushikesh', 'rushikesh.gadkar@ttl.com', 'Sr. Developer', ['Gadale, Rushikesh', 'Rushikesh Gadkar', 'Rushikesh']),
  canonical('Jawase, Krutika', 'krutika.jawase@ttl.com', 'Sr. Developer', ['Krutika Jawase', 'Krutika'])
];

const groupAliases = [
  group('Puneeth & Gaurav', ['C. Puneeth', 'Tiwari, Gaurav']),
  group('Shashi & Harshvardhan', ['Dhumal, Shashi', 'Patil, Harshvardhan']),
  group('Shashi & Rushi', ['Dhumal, Shashi', 'Gadkar, Rushikesh']),
  group('Shashi & Somnath', ['Dhumal, Shashi', 'Pansambal, Somnath']),
  group('Somnath & Nikhil', ['Pansambal, Somnath', 'Nandakumar, Nikhil']),
  group('Vishal & Gourav', ['Kadam, Vishal', 'Tiwari, Gaurav']),
  group('VivekSuraj', ['Chandekar, Vivek', 'Bhegade, Suraj'])
];

const pool = await getPool();
const client = await pool.connect();

try {
  await client.query('BEGIN');

  const roleIds = await getRoleIds(client);
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const userHash = await bcrypt.hash(userPassword, 12);
  const canonicalIds = new Map();
  const canonicalNames = new Set(users.map((user) => user.fullName));

  for (const user of users) {
    const userId = await upsertUser(client, {
      ...user,
      roleId: roleIds[user.role],
      passwordHash: user.role === 'admin' ? adminHash : userHash
    });
    canonicalIds.set(user.fullName, userId);
  }

  let remappedTasks = 0;
  for (const user of users) {
    const aliases = [user.fullName, ...(user.aliases || [])];
    for (const alias of aliases) {
      remappedTasks += await remapTasks(client, alias, user.fullName, canonicalIds.get(user.fullName));
    }
  }

  let clonedGroupTasks = 0;
  for (const item of groupAliases) {
    const sourceTasks = await findTasksByEmployeeName(client, item.alias);
    for (const sourceTask of sourceTasks) {
      for (const targetName of item.targetNames) {
        const targetUserId = canonicalIds.get(targetName);
        if (!targetUserId) continue;
        const cloned = await cloneTaskIfMissing(client, sourceTask, targetName, targetUserId);
        if (cloned) clonedGroupTasks += 1;
      }
    }
    await deleteTasksByEmployeeName(client, item.alias);
  }

  const deactivatedUsers = await deactivateNonCanonicalUsers(client, canonicalNames);
  await client.query('COMMIT');

  console.log('Known user sync completed.');
  console.table({
    canonical_users: users.length,
    remapped_tasks: remappedTasks,
    cloned_group_tasks: clonedGroupTasks,
    deactivated_non_canonical_users: deactivatedUsers
  });
  console.log(`Admin login: Pattanaik, Jayant / ${adminPassword}`);
  console.log(`Normal user password: ${userPassword}`);
  process.exit(0);
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Known user sync failed.');
  console.error(error);
  process.exit(1);
} finally {
  client.release();
}

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

function group(alias, targetNames) {
  return { alias, targetNames };
}

async function getRoleIds(client) {
  const result = await client.query('SELECT role_id, role_name FROM Roles');
  return Object.fromEntries(result.rows.map((role) => [role.role_name, role.role_id]));
}

async function upsertUser(client, user) {
  const existing = await client.query(
    'SELECT user_id FROM Users WHERE LOWER(email) = $1 OR LOWER(full_name) = $2 LIMIT 1',
    [user.email.toLowerCase(), user.fullName.toLowerCase()]
  );

  if (existing.rows.length) {
    const userId = existing.rows[0].user_id;
    await client.query(
      `
        UPDATE Users
        SET full_name = $1,
            email = $2,
            password_hash = $3,
            role_id = $4,
            department = $5,
            designation = $6,
            status = 'Active',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
      `,
      [user.fullName, user.email.toLowerCase(), user.passwordHash, user.roleId, user.department, user.designation, userId]
    );
    return userId;
  }

  const created = await client.query(
    `
      INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active')
      RETURNING user_id
    `,
    [user.fullName, user.email.toLowerCase(), user.passwordHash, user.roleId, user.department, user.designation]
  );
  return created.rows[0].user_id;
}

async function remapTasks(client, alias, canonicalName, canonicalUserId) {
  const result = await client.query(
    `
      UPDATE Tasks t
      SET assigned_user_id = $1,
          employee_name = $2,
          updated_at = CURRENT_TIMESTAMP
      FROM Users u
      WHERE (u.user_id = t.assigned_user_id OR t.assigned_user_id IS NULL)
        AND (LOWER(t.employee_name) = $3 OR LOWER(u.full_name) = $3)
    `,
    [canonicalUserId, canonicalName, alias.toLowerCase()]
  );
  return result.rowCount || 0;
}

async function findTasksByEmployeeName(client, employeeName) {
  const result = await client.query(
    `
      SELECT *
      FROM Tasks
      WHERE LOWER(employee_name) = $1
    `,
    [employeeName.toLowerCase()]
  );
  return result.rows;
}

async function cloneTaskIfMissing(client, sourceTask, targetName, targetUserId) {
  const exists = await client.query(
    `
      SELECT task_id
      FROM Tasks
      WHERE task_title = $1
        AND employee_name = $2
        AND ((project_id IS NULL AND $3::int IS NULL) OR project_id = $3)
        AND ((module_name IS NULL AND $4::text IS NULL) OR module_name = $4)
        AND ((start_date IS NULL AND $5::date IS NULL) OR start_date = $5)
      LIMIT 1
    `,
    [sourceTask.task_title, targetName, sourceTask.project_id, sourceTask.module_name, sourceTask.start_date]
  );

  if (exists.rows.length) return false;

  await client.query(
    `
      INSERT INTO Tasks (
        task_title, description, assigned_user_id, employee_name, status, priority,
        project_id, module_name, start_date, end_date, due_date, onsite_offshore,
        remarks, created_by, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `,
    [
      sourceTask.task_title,
      sourceTask.description,
      targetUserId,
      targetName,
      sourceTask.status,
      sourceTask.priority,
      sourceTask.project_id,
      sourceTask.module_name,
      sourceTask.start_date,
      sourceTask.end_date,
      sourceTask.due_date,
      sourceTask.onsite_offshore,
      sourceTask.remarks,
      sourceTask.created_by
    ]
  );

  return true;
}

async function deleteTasksByEmployeeName(client, employeeName) {
  await client.query('DELETE FROM Tasks WHERE LOWER(employee_name) = $1', [employeeName.toLowerCase()]);
}

async function deactivateNonCanonicalUsers(client, canonicalNames) {
  const params = [...canonicalNames];
  const placeholders = params.map((_, index) => `$${index + 1}`);

  const result = await client.query(
    `
      UPDATE Users
      SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP
      WHERE full_name NOT IN (${placeholders.join(', ')})
    `,
    params
  );

  return result.rowCount || 0;
}
