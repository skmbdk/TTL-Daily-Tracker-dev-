import dotenv from 'dotenv';
import path from 'node:path';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getPool } from './config/db.js';
import logger from './config/logger.js';
import loggerMiddleware from './middleware/loggerMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS.'));
    }
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// app.get('/api/ready', async (_req, res, next) => {
//   try {
//     await getPool();
//     res.json({ status: 'ok', database: 'connected' });
//   } catch (error) {
//     next(error);
//   }
// });
app.get('/api/ready', async (_req, res, next) => {
  try {
    const pool = await getPool();

    // Actual PostgreSQL query execute hogi
    const result = await pool.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        inet_server_addr() AS database_server,
        inet_server_port() AS database_port,
        NOW() AS database_time
    `);

    res.json({
      status: 'ok',
      database: 'connected',
      details: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});


app.use('/api/auth', authRoutes);
app.use('/api/notifications', protect, notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error.';

  if (process.env.NODE_ENV !== 'test') {
    logger.error(`[ERROR_HANDLER] Status ${statusCode}: ${error.message}`, { stack: error.stack });
  }

  res.status(statusCode).json({
    message: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : message,
    detail: error.message
  });
});

initSocket(server, allowedOrigins);

const autoMigrateCompletedStatus = async () => {
  try {
    const pool = await getPool();
    await pool.query('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;');
    await pool.query('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS ck_tasks_status;');
    await pool.query('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS "CK_Tasks_status";');
    await pool.query("UPDATE tasks SET status = 'Completed' WHERE status = 'Done';");
    await pool.query("ALTER TABLE tasks ADD CONSTRAINT ck_tasks_status CHECK (status IN ('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing', 'Completed', 'Blocked'));");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS TaskAttachments (
        attachment_id SERIAL PRIMARY KEY,
        task_id INT NOT NULL REFERENCES Tasks(task_id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES Users(user_id),
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100),
        file_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS AuditLogs (
        audit_id SERIAL PRIMARY KEY,
        actor_id INT REFERENCES Users(user_id) ON DELETE SET NULL,
        target_user_id INT REFERENCES Users(user_id) ON DELETE SET NULL,
        action_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        old_value VARCHAR(255),
        new_value VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query('ALTER TABLE TaskComments ADD COLUMN IF NOT EXISTS parent_comment_id INT REFERENCES TaskComments(comment_id) ON DELETE CASCADE;');
    await pool.query('ALTER TABLE Tasks ADD COLUMN IF NOT EXISTS story_points INT DEFAULT 1;');
    await pool.query('UPDATE Tasks SET story_points = 1 WHERE story_points IS NULL;');
    await pool.query('ALTER TABLE Projects ADD COLUMN IF NOT EXISTS parent_project_id INT REFERENCES Projects(project_id) ON DELETE SET NULL;');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Notifications (
        notification_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        related_task_id INT REFERENCES Tasks(task_id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info('PostgreSQL status constraint, story_points, parent_project_id, Notifications, TaskAttachments, TaskComments parent_comment_id & AuditLogs verified successfully.');
  } catch (error) {
    logger.error(`Auto migration status warning: ${error?.message}`);
  }
};

autoMigrateCompletedStatus();

server.listen(port, () => {
  logger.info(`API server running on http://localhost:${port}`);
});

