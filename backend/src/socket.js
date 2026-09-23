// import jwt from 'jsonwebtoken';
// import { Server } from 'socket.io';
// import { getPool, sql } from './config/db.js';

// let io;

// const buildCors = (allowedOrigins = []) => ({
//   origin(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//       return;
//     }

//     callback(new Error('Origin not allowed by CORS.'));
//   }
// });

// export const initSocket = (server, allowedOrigins = []) => {
//   io = new Server(server, {
//     cors: buildCors(allowedOrigins)
//   });

//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth?.token;
//       if (!token) {
//         next(new Error('Authentication token is required.'));
//         return;
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const pool = await getPool();
//       const result = await pool
//         .request()
//         .input('user_id', sql.Int, decoded.user_id)
//         .query(`
//           SELECT u.user_id, u.full_name, u.email, u.status, r.role_name
//           FROM Users u
//           INNER JOIN Roles r ON r.role_id = u.role_id
//           WHERE u.user_id = @user_id AND u.status = 'Active'
//         `);

//       const user = result.recordset[0];
//       if (!user) {
//         next(new Error('User session is no longer valid.'));
//         return;
//       }

//       socket.user = user;
//       next();
//     } catch {
//       next(new Error('Invalid or expired token.'));
//     }
//   });

//   io.on('connection', (socket) => {
//     const userId = socket.user?.user_id;
//     if (!userId) return;

//     socket.join(`user:${userId}`);
//     if (socket.user.role_name === 'admin') {
//       socket.join('role:admin');
//     }
//   });

//   return io;
// };

// export const getIO = () => io;

// export const emitToUser = (userId, event, payload) => {
//   if (!io || !userId) return false;
//   io.to(`user:${userId}`).emit(event, payload);
//   return true;
// };

// export const emitToAdmins = (event, payload) => {
//   if (!io) return false;
//   io.to('role:admin').emit(event, payload);
//   return true;
// };

// export const emitTaskChange = ({ task, taskId, action, userIds = [] }) => {
//   if (!io || (!task && !taskId)) return false;

//   const rooms = new Set(['role:admin']);
//   userIds.filter(Boolean).forEach((userId) => rooms.add(`user:${userId}`));
//   if (task?.assigned_user_id) rooms.add(`user:${task.assigned_user_id}`);

//   io.to([...rooms]).emit('task:changed', {
//     action,
//     task: task || null,
//     task_id: task?.task_id || taskId
//   });
//   return true;
// };


import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { getPool } from './config/db.js';

let io;

const buildCors = (allowedOrigins = []) => ({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS.'));
  }
});

export const initSocket = (server, allowedOrigins = []) => {
  io = new Server(server, {
    cors: buildCors(allowedOrigins)
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        next(new Error('Authentication token is required.'));
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const pool = await getPool();
      const result = await pool.query(
        `
          SELECT u.user_id, u.full_name, u.email, u.status, r.role_name
          FROM Users u
          INNER JOIN Roles r ON r.role_id = u.role_id
          WHERE u.user_id = $1 AND u.status = 'Active'
        `,
        [decoded.user_id]
      );

      const user = result.rows[0];
      if (!user) {
        next(new Error('User session is no longer valid.'));
        return;
      }

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.user_id;
    if (!userId) return;

    socket.join(`user:${userId}`);
    if (socket.user.role_name === 'admin') {
      socket.join('role:admin');
    }
  });

  return io;
};

export const getIO = () => io;

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return false;
  io.to(`user:${userId}`).emit(event, payload);
  return true;
};

export const emitToAdmins = (event, payload) => {
  if (!io) return false;
  io.to('role:admin').emit(event, payload);
  return true;
};

export const emitTaskChange = ({ task, taskId, action, userIds = [] }) => {
  if (!io || (!task && !taskId)) return false;

  const rooms = new Set(['role:admin']);
  userIds.filter(Boolean).forEach((userId) => rooms.add(`user:${userId}`));
  if (task?.assigned_user_id) rooms.add(`user:${task.assigned_user_id}`);

  io.to([...rooms]).emit('task:changed', {
    action,
    task: task || null,
    task_id: task?.task_id || taskId
  });
  return true;
};
