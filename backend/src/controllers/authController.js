// import bcrypt from 'bcryptjs';
// import crypto from 'node:crypto';
// import { getPool, sql } from '../config/db.js';
// import { generateToken } from '../utils/generateToken.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import { markActive, markInactive } from '../utils/activeUsers.js';

// export const login = asyncHandler(async (req, res) => {
//   const { email, identifier, password } = req.body;
//   const loginId = String(identifier || email || '').trim().toLowerCase();

//   if (!loginId || !password) {
//     return res.status(400).json({ message: 'Name/email and password are required.' });
//   }

//   const pool = await getPool();
//   const result = await pool
//     .request()
//     .input('identifier', sql.NVarChar(255), loginId)
//     .query(`
//       SELECT u.user_id, u.full_name, u.email, u.password_hash, u.department,
//              u.designation, u.status, r.role_name
//       FROM Users u
//       INNER JOIN Roles r ON r.role_id = u.role_id
//       WHERE (LOWER(u.email) = @identifier OR LOWER(u.full_name) = @identifier)
//         AND u.status = 'Active'
//     `);

//   const user = result.recordset[0];
//   if (!user) {
//     return res.status(401).json({ message: 'Invalid name/email or password.' });
//   }

//   const isPasswordLogin = await bcrypt.compare(password, user.password_hash);
//   const isPresenterLogin =
//     user.role_name !== 'admin' && password === (process.env.PRESENTER_PASSWORD || 'Presenter@12345');

//   if (!isPasswordLogin && !isPresenterLogin) {
//     return res.status(401).json({ message: 'Invalid name/email or password.' });
//   }

//   delete user.password_hash;
//   const sessionId = crypto.randomUUID();
//   const sessionUser = isPresenterLogin
//     ? {
//         ...user,
//         original_role_name: user.role_name,
//         role_name: 'presenter',
//         session_mode: 'presenter',
//         read_only: true,
//         session_id: sessionId
//       }
//     : {
//         ...user,
//         session_mode: 'standard',
//         read_only: false,
//         session_id: sessionId
//       };

//   const token = generateToken(sessionUser);
//   markActive(sessionUser, sessionId);

//   return res.json({ token, user: sessionUser });
// });

// export const register = asyncHandler(async (req, res) => {
//   const { full_name, email, password, department, designation } = req.body;

//   if (!full_name || !email || !password) {
//     return res.status(400).json({ message: 'Full name, email, and password are required.' });
//   }

//   const pool = await getPool();
//   const existing = await pool
//     .request()
//     .input('email', sql.NVarChar(255), email.toLowerCase())
//     .query('SELECT user_id FROM Users WHERE LOWER(email) = @email');

//   if (existing.recordset.length) {
//     return res.status(409).json({ message: 'A user with this email already exists.' });
//   }

//   const roleResult = await pool
//     .request()
//     .input('role_name', sql.NVarChar(50), 'user')
//     .query('SELECT role_id FROM Roles WHERE role_name = @role_name');

//   const passwordHash = await bcrypt.hash(password, 12);
//   const created = await pool
//     .request()
//     .input('full_name', sql.NVarChar(150), full_name)
//     .input('email', sql.NVarChar(255), email.toLowerCase())
//     .input('password_hash', sql.NVarChar(255), passwordHash)
//     .input('role_id', sql.Int, roleResult.recordset[0].role_id)
//     .input('department', sql.NVarChar(100), department || null)
//     .input('designation', sql.NVarChar(100), designation || null)
//     .query(`
//       INSERT INTO Users (full_name, email, password_hash, role_id, department, designation)
//       OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.department,
//              INSERTED.designation, INSERTED.status, INSERTED.created_at
//       VALUES (@full_name, @email, @password_hash, @role_id, @department, @designation)
//     `);

//   return res.status(201).json({ user: { ...created.recordset[0], role_name: 'user' } });
// });

// export const me = asyncHandler(async (req, res) => {
//   return res.json({ user: req.user });
// });

// export const heartbeat = asyncHandler(async (_req, res) => {
//   return res.json({ status: 'active' });
// });

// export const logout = asyncHandler(async (req, res) => {
//   markInactive(req.sessionId);
//   return res.json({ message: 'Logged out. Remove the JWT on the client.' });
// });


import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getPool } from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { markActive, markInactive } from '../utils/activeUsers.js';

export const login = asyncHandler(async (req, res) => {
  const { email, identifier, password } = req.body;
  const loginId = String(identifier || email || '').trim().toLowerCase();

  if (!loginId || !password) {
    return res.status(400).json({ message: 'Name/email and password are required.' });
  }

  const pool = await getPool();
  const result = await pool.query(
    `
      SELECT u.user_id, u.full_name, u.email, u.password_hash, u.department,
             u.designation, u.status, r.role_name
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      WHERE (LOWER(u.email) = $1 OR LOWER(u.full_name) = $1)
        AND u.status = 'Active'
    `,
    [loginId]
  );

  const user = result.rows[0];
  if (!user) {
    return res.status(401).json({ message: 'Invalid name/email or password.' });
  }

  const isPasswordLogin = await bcrypt.compare(password, user.password_hash);
  const isPresenterLogin =
    user.role_name !== 'admin' && password === (process.env.PRESENTER_PASSWORD || 'Presenter@12345');

  if (!isPasswordLogin && !isPresenterLogin) {
    return res.status(401).json({ message: 'Invalid name/email or password.' });
  }

  delete user.password_hash;
  const sessionId = crypto.randomUUID();
  const sessionUser = isPresenterLogin
    ? {
        ...user,
        original_role_name: user.role_name,
        role_name: 'presenter',
        session_mode: 'presenter',
        read_only: true,
        session_id: sessionId
      }
    : {
        ...user,
        session_mode: 'standard',
        read_only: false,
        session_id: sessionId
      };

  const token = generateToken(sessionUser);
  markActive(sessionUser, sessionId);

  return res.json({ token, user: sessionUser });
});

export const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, department, designation } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  const pool = await getPool();
  const existing = await pool.query(
    'SELECT user_id FROM Users WHERE LOWER(email) = $1',
    [email.toLowerCase()]
  );

  if (existing.rows.length) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }

  const roleResult = await pool.query(
    'SELECT role_id FROM Roles WHERE role_name = $1',
    ['user']
  );

  const passwordHash = await bcrypt.hash(password, 12);
  const created = await pool.query(
    `
      INSERT INTO Users (full_name, email, password_hash, role_id, department, designation)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, full_name, email, department, designation, status, created_at
    `,
    [full_name, email.toLowerCase(), passwordHash, roleResult.rows[0].role_id, department || null, designation || null]
  );

  return res.status(201).json({ user: { ...created.rows[0], role_name: 'user' } });
});

export const me = asyncHandler(async (req, res) => {
  return res.json({ user: req.user });
});

export const heartbeat = asyncHandler(async (_req, res) => {
  return res.json({ status: 'active' });
});

export const logout = asyncHandler(async (req, res) => {
  markInactive(req.sessionId);
  return res.json({ message: 'Logged out. Remove the JWT on the client.' });
});
