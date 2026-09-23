// import jwt from 'jsonwebtoken';
// import { getPool, sql } from '../config/db.js';
// import { markActive } from '../utils/activeUsers.js';

// const USER_CACHE_TTL_MS = Number(process.env.AUTH_USER_CACHE_TTL_MS || 60 * 1000);
// const userCache = new Map();

// export const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || '';
//     const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

//     if (!token) {
//       return res.status(401).json({ message: 'Authentication token is required.' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await getCachedActiveUser(decoded.user_id);

//     if (!user) {
//       return res.status(401).json({ message: 'User session is no longer valid.' });
//     }

//     const sessionId = decoded.session_id || `legacy:${decoded.user_id}:${token.slice(-12)}`;
//     req.sessionId = sessionId;
//     req.user =
//       decoded.session_mode === 'presenter' || decoded.role === 'presenter'
//         ? {
//             ...user,
//             original_role_name: user.role_name,
//             role_name: 'presenter',
//             session_mode: 'presenter',
//             read_only: true,
//             session_id: sessionId
//           }
//         : {
//             ...user,
//             session_mode: 'standard',
//             read_only: false,
//             session_id: sessionId
//           };
//     markActive(req.user, sessionId);
//     return next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid or expired token.' });
//   }
// };

// const getCachedActiveUser = async (userId) => {
//   const cacheKey = String(userId);
//   const cached = userCache.get(cacheKey);
//   if (cached && cached.expiresAt > Date.now()) {
//     return cached.user;
//   }

//   const pool = await getPool();
//   const result = await pool
//     .request()
//     .input('user_id', sql.Int, userId)
//     .query(`
//       SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
//              r.role_name
//       FROM Users u
//       INNER JOIN Roles r ON r.role_id = u.role_id
//       WHERE u.user_id = @user_id AND u.status = 'Active'
//     `);

//   const user = result.recordset[0] || null;
//   if (user) {
//     userCache.set(cacheKey, {
//       user,
//       expiresAt: Date.now() + USER_CACHE_TTL_MS
//     });
//   } else {
//     userCache.delete(cacheKey);
//   }

//   return user;
// };



import jwt from 'jsonwebtoken';
import { getPool } from '../config/db.js';
import { markActive } from '../utils/activeUsers.js';

const USER_CACHE_TTL_MS = Number(process.env.AUTH_USER_CACHE_TTL_MS || 60 * 1000);
const userCache = new Map();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getCachedActiveUser(decoded.user_id);

    if (!user) {
      return res.status(401).json({ message: 'User session is no longer valid.' });
    }

    const sessionId = decoded.session_id || `legacy:${decoded.user_id}:${token.slice(-12)}`;
    req.sessionId = sessionId;
    req.user =
      decoded.session_mode === 'presenter' || decoded.role === 'presenter'
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
    markActive(req.user, sessionId);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const getCachedActiveUser = async (userId) => {
  const cacheKey = String(userId);
  const cached = userCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }

  const pool = await getPool();
  const result = await pool.query(
    `
      SELECT u.user_id, u.full_name, u.email, u.department, u.designation, u.status,
             r.role_name
      FROM Users u
      INNER JOIN Roles r ON r.role_id = u.role_id
      WHERE u.user_id = $1 AND u.status = 'Active'
    `,
    [userId]
  );

  const user = result.rows[0] || null;
  if (user) {
    userCache.set(cacheKey, {
      user,
      expiresAt: Date.now() + USER_CACHE_TTL_MS
    });
  } else {
    userCache.delete(cacheKey);
  }

  return user;
};
