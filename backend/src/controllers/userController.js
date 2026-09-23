// import bcrypt from 'bcryptjs';
// import { getPool, sql } from '../config/db.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// export const getUsers = asyncHandler(async (req, res) => {
//   const { search, status, role } = req.query;
//   const pool = await getPool();
//   const request = pool.request();
//   const where = [];

//   if (search) {
//     request.input('search', sql.NVarChar(255), `%${search}%`);
//     where.push('(u.full_name LIKE @search OR u.email LIKE @search OR u.department LIKE @search)');
//   }
//   if (status && status !== 'All') {
//     request.input('status', sql.NVarChar(30), status);
//     where.push('u.status = @status');
//   } else if (!status) {
//     request.input('status', sql.NVarChar(30), 'Active');
//     where.push('u.status = @status');
//   }
//   if (role) {
//     request.input('role_name', sql.NVarChar(50), role);
//     where.push('r.role_name = @role_name');
//   }

//   const result = await request.query(`
//     SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
//            u.created_at, u.updated_at, r.role_name,
//            COUNT(t.task_id) AS task_count
//     FROM Users u
//     INNER JOIN Roles r ON r.role_id = u.role_id
//     LEFT JOIN Tasks t ON t.assigned_user_id = u.user_id
//     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
//     GROUP BY u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
//              u.created_at, u.updated_at, r.role_name
//     ORDER BY u.created_at DESC
//   `);

//   return res.json({ users: result.recordset });
// });

// export const getUserById = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const result = await pool
//     .request()
//     .input('user_id', sql.Int, req.params.id)
//     .query(`
//       SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
//              u.created_at, u.updated_at, r.role_name,
//              COUNT(t.task_id) AS task_count
//       FROM Users u
//       INNER JOIN Roles r ON r.role_id = u.role_id
//       LEFT JOIN Tasks t ON t.assigned_user_id = u.user_id
//       WHERE u.user_id = @user_id
//       GROUP BY u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
//                u.created_at, u.updated_at, r.role_name
//     `);

//   if (!result.recordset.length) return res.status(404).json({ message: 'User not found.' });
//   return res.json({ user: result.recordset[0] });
// });

// export const createUser = asyncHandler(async (req, res) => {
//   const { full_name, email, password, role = 'user', department, designation, status = 'Active' } = req.body;

//   if (!full_name || !email || !password) {
//     return res.status(400).json({ message: 'Full name, email, and password are required.' });
//   }

//   const pool = await getPool();
//   const roleResult = await pool
//     .request()
//     .input('role_name', sql.NVarChar(50), role)
//     .query('SELECT role_id FROM Roles WHERE role_name = @role_name');

//   if (!roleResult.recordset.length) {
//     return res.status(400).json({ message: 'Invalid role.' });
//   }

//   const passwordHash = await bcrypt.hash(password, 12);
//   const result = await pool
//     .request()
//     .input('full_name', sql.NVarChar(150), full_name)
//     .input('email', sql.NVarChar(255), email.toLowerCase())
//     .input('password_hash', sql.NVarChar(255), passwordHash)
//     .input('role_id', sql.Int, roleResult.recordset[0].role_id)
//     .input('department', sql.NVarChar(100), department || null)
//     .input('designation', sql.NVarChar(100), designation || null)
//     .input('status', sql.NVarChar(30), status)
//     .query(`
//       INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
//       OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.department,
//              INSERTED.designation, INSERTED.status, INSERTED.created_at
//       VALUES (@full_name, @email, @password_hash, @role_id, @department, @designation, @status)
//     `);

//   return res.status(201).json({ user: { ...result.recordset[0], role_name: role } });
// });

// export const updateUser = asyncHandler(async (req, res) => {
//   const { full_name, email, password, role, department, designation, status } = req.body;
//   const pool = await getPool();

//   const existing = await pool
//     .request()
//     .input('user_id', sql.Int, req.params.id)
//     .query('SELECT user_id FROM Users WHERE user_id = @user_id');

//   if (!existing.recordset.length) return res.status(404).json({ message: 'User not found.' });

//   let roleId = null;
//   if (role) {
//     const roleResult = await pool
//       .request()
//       .input('role_name', sql.NVarChar(50), role)
//       .query('SELECT role_id FROM Roles WHERE role_name = @role_name');
//     if (!roleResult.recordset.length) return res.status(400).json({ message: 'Invalid role.' });
//     roleId = roleResult.recordset[0].role_id;
//   }

//   const passwordHash = password ? await bcrypt.hash(password, 12) : null;

//   const result = await pool
//     .request()
//     .input('user_id', sql.Int, req.params.id)
//     .input('full_name', sql.NVarChar(150), full_name || null)
//     .input('email', sql.NVarChar(255), email ? email.toLowerCase() : null)
//     .input('password_hash', sql.NVarChar(255), passwordHash)
//     .input('role_id', sql.Int, roleId)
//     .input('department', sql.NVarChar(100), department || null)
//     .input('designation', sql.NVarChar(100), designation || null)
//     .input('status', sql.NVarChar(30), status || null)
//     .query(`
//       UPDATE Users
//       SET full_name = COALESCE(@full_name, full_name),
//           email = COALESCE(@email, email),
//           password_hash = COALESCE(@password_hash, password_hash),
//           role_id = COALESCE(@role_id, role_id),
//           department = COALESCE(@department, department),
//           designation = COALESCE(@designation, designation),
//           status = COALESCE(@status, status),
//           updated_at = SYSUTCDATETIME()
//       OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.department,
//              INSERTED.designation, INSERTED.status, INSERTED.updated_at
//       WHERE user_id = @user_id
//     `);

//   return res.json({ user: result.recordset[0] });
// });

// export const deleteUser = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const result = await pool
//     .request()
//     .input('user_id', sql.Int, req.params.id)
//     .query(`
//       UPDATE Users
//       SET status = 'Inactive', updated_at = SYSUTCDATETIME()
//       WHERE user_id = @user_id
//     `);

//   if (!result.rowsAffected[0]) return res.status(404).json({ message: 'User not found.' });
//   return res.json({ message: 'User deactivated successfully.' });
// });


import bcrypt from 'bcryptjs';
import { getPool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const recordAuditLog = async (pool, { actorId, targetUserId, actionType, description, oldValue, newValue }) => {
  try {
    await pool.query(
      `
        INSERT INTO AuditLogs (actor_id, target_user_id, action_type, description, old_value, new_value)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [actorId || null, targetUserId || null, actionType, description, oldValue || null, newValue || null]
    );
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to insert audit log:', error);
    }
  }
};

export const getUsers = asyncHandler(async (req, res) => {
  const { search, status, role } = req.query;
  const pool = await getPool();
  const params = [];
  const where = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.department ILIKE $${params.length})`);
  }
  if (status && status !== 'All') {
    params.push(status);
    where.push(`u.status = $${params.length}`);
  } else if (!status) {
    params.push('Active');
    where.push(`u.status = $${params.length}`);
  }
  if (role) {
    params.push(role);
    where.push(`r.role_name = $${params.length}`);
  }

  const result = await pool.query(
    `
      SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
             u.created_at, u.updated_at, r.role_name,
             COUNT(t.task_id)::int AS task_count
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN Tasks t ON t.assigned_user_id = u.user_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
               u.created_at, u.updated_at, r.role_name
      ORDER BY u.created_at DESC
    `,
    params
  );

  return res.json({ users: result.rows });
});

export const getUserById = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
             u.created_at, u.updated_at, r.role_name,
             COUNT(t.task_id)::int AS task_count
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN Tasks t ON t.assigned_user_id = u.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
               u.created_at, u.updated_at, r.role_name
    `,
    [req.params.id]
  );

  if (!result.rows.length) return res.status(404).json({ message: 'User not found.' });
  return res.json({ user: result.rows[0] });
});

export const createUser = asyncHandler(async (req, res) => {
  const { full_name, email, password, role = 'user', department, designation, status = 'Active' } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  const pool = await getPool();
  const roleResult = await pool.query(
    'SELECT role_id FROM Roles WHERE role_name = $1',
    [role]
  );

  if (!roleResult.rows.length) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `
      INSERT INTO Users (full_name, email, password_hash, role_id, department, designation, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, full_name, email, department, designation, status, created_at
    `,
    [full_name, email.toLowerCase(), passwordHash, roleResult.rows[0].role_id, department || null, designation || null, status]
  );

  const createdUser = result.rows[0];
  const actorName = req.user?.full_name || 'Admin';

  await recordAuditLog(pool, {
    actorId: req.user?.user_id,
    targetUserId: createdUser.user_id,
    actionType: 'USER_CREATED',
    description: `${actorName} created user ${createdUser.full_name} (${role})`,
    newValue: role
  });

  return res.status(201).json({ user: { ...createdUser, role_name: role } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { full_name, email, password, role, department, designation, status } = req.body;
  const pool = await getPool();

  const existing = await pool.query(
    `
      SELECT u.user_id, u.full_name, u.status, r.role_name
      FROM Users u
      LEFT JOIN Roles r ON r.role_id = u.role_id
      WHERE u.user_id = $1
    `,
    [req.params.id]
  );

  if (!existing.rows.length) return res.status(404).json({ message: 'User not found.' });
  const oldUser = existing.rows[0];

  let roleId = null;
  if (role) {
    const roleResult = await pool.query(
      'SELECT role_id FROM Roles WHERE role_name = $1',
      [role]
    );
    if (!roleResult.rows.length) return res.status(400).json({ message: 'Invalid role.' });
    roleId = roleResult.rows[0].role_id;
  }

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const result = await pool.query(
    `
      UPDATE Users
      SET full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          password_hash = COALESCE($3, password_hash),
          role_id = COALESCE($4, role_id),
          department = COALESCE($5, department),
          designation = COALESCE($6, designation),
          status = COALESCE($7, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $8
      RETURNING user_id, full_name, email, department, designation, status, updated_at
    `,
    [
      full_name || null,
      email ? email.toLowerCase() : null,
      passwordHash,
      roleId,
      department || null,
      designation || null,
      status || null,
      req.params.id
    ]
  );

  const updatedUser = result.rows[0];
  const actorName = req.user?.full_name || 'Admin';

  if (role && role !== oldUser.role_name) {
    await recordAuditLog(pool, {
      actorId: req.user?.user_id,
      targetUserId: updatedUser.user_id,
      actionType: 'ROLE_CHANGE',
      description: `${actorName} changed role of ${oldUser.full_name} from '${oldUser.role_name}' to '${role}'`,
      oldValue: oldUser.role_name,
      newValue: role
    });
  }

  if (status && status !== oldUser.status) {
    await recordAuditLog(pool, {
      actorId: req.user?.user_id,
      targetUserId: updatedUser.user_id,
      actionType: 'STATUS_CHANGE',
      description: `${actorName} changed status of ${oldUser.full_name} from '${oldUser.status}' to '${status}'`,
      oldValue: oldUser.status,
      newValue: status
    });
  }

  return res.json({ user: updatedUser });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const pool = await getPool();

  const existing = await pool.query(
    'SELECT user_id, full_name, status FROM Users WHERE user_id = $1',
    [req.params.id]
  );

  if (!existing.rows.length) return res.status(404).json({ message: 'User not found.' });
  const oldUser = existing.rows[0];

  await pool.query(
    `
      UPDATE Users
      SET status = 'Inactive', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `,
    [req.params.id]
  );

  const actorName = req.user?.full_name || 'Admin';
  await recordAuditLog(pool, {
    actorId: req.user?.user_id,
    targetUserId: oldUser.user_id,
    actionType: 'USER_DEACTIVATED',
    description: `${actorName} deactivated user ${oldUser.full_name}`,
    oldValue: oldUser.status,
    newValue: 'Inactive'
  });

  return res.json({ message: 'User deactivated successfully.' });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const { action_type, search, page = 1, page_size = 25 } = req.query;

  const params = [];
  const where = [];

  if (action_type && action_type !== 'all') {
    params.push(action_type);
    where.push(`l.action_type = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    const sIdx = params.length;
    where.push(`(actor.full_name ILIKE $${sIdx} OR target.full_name ILIKE $${sIdx} OR l.description ILIKE $${sIdx})`);
  }

  const limit = Math.min(Math.max(1, Number(page_size)), 100);
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const result = await pool.query(
    `
      SELECT l.audit_id, l.actor_id, l.target_user_id, l.action_type, l.description,
             l.old_value, l.new_value, l.created_at,
             actor.full_name AS actor_name, actor.email AS actor_email,
             target.full_name AS target_name, target.email AS target_email
      FROM AuditLogs l
      LEFT JOIN Users actor ON actor.user_id = l.actor_id
      LEFT JOIN Users target ON target.user_id = l.target_user_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY l.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `,
    params
  );

  const countParams = params.slice(0, params.length - 2);
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM AuditLogs l
      LEFT JOIN Users actor ON actor.user_id = l.actor_id
      LEFT JOIN Users target ON target.user_id = l.target_user_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    `,
    countParams
  );

  const total = countResult.rows[0]?.total || 0;

  return res.json({
    logs: result.rows,
    pagination: {
      page: Number(page),
      page_size: limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit))
    }
  });
});
