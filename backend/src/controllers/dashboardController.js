// import { getPool, sql } from '../config/db.js';
// import { asyncHandler } from '../utils/asyncHandler.js';
// import { getActiveUsers } from '../utils/activeUsers.js';

// const DASHBOARD_CACHE_TTL_MS = Number(process.env.DASHBOARD_CACHE_TTL_MS || 30 * 1000);
// const dashboardCache = new Map();

// export const getAdminDashboard = asyncHandler(async (_req, res) => {
//   const data = await getCachedDashboardData();
//   return res.json(data);
// });

// export const getUserDashboard = asyncHandler(async (req, res) => {
//   const data = await getCachedDashboardData(req.user.role_name === 'presenter' ? null : req.user.user_id);
//   return res.json(data);
// });

// export const getActiveDashboardUsers = asyncHandler(async (_req, res) => {
//   return res.json({ active_users: getActiveUsers() });
// });

// export const getAdminActivityCenter = asyncHandler(async (_req, res) => {
//   const pool = await getPool();
//   const [summary, recentActivity, recentComments, recentRemarks, overdueTasks] = await Promise.all([
//     pool.request().query(`
//       SELECT
//         COUNT(*) AS total_tasks,
//         SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END) AS open_tasks,
//         SUM(CASE WHEN t.status = 'Blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
//         SUM(CASE WHEN t.status <> 'Done' AND t.due_date < CAST(SYSUTCDATETIME() AS DATE) THEN 1 ELSE 0 END) AS overdue_tasks,
//         SUM(CASE WHEN t.priority IN ('High', 'Critical') AND t.status <> 'Done' THEN 1 ELSE 0 END) AS high_priority_open
//       FROM Tasks t
//     `),
//     pool.request().query(`
//       SELECT TOP 30 h.history_id, h.task_id, t.task_title, h.change_description, h.changed_at,
//              u.full_name AS changed_by_name, t.status, t.priority
//       FROM TaskHistory h
//       INNER JOIN Tasks t ON t.task_id = h.task_id
//       LEFT JOIN Users u ON u.user_id = h.changed_by
//       ORDER BY h.changed_at DESC
//     `),
//     pool.request().query(`
//       SELECT TOP 12 c.comment_id, c.task_id, c.comment_text, c.created_at,
//              t.task_title, u.full_name AS author_name
//       FROM TaskComments c
//       INNER JOIN Tasks t ON t.task_id = c.task_id
//       INNER JOIN Users u ON u.user_id = c.user_id
//       ORDER BY c.created_at DESC
//     `),
//     pool.request().query(`
//       SELECT TOP 12 r.remark_id, r.task_id, r.remark_text, r.remark_date, r.created_at,
//              t.task_title, u.full_name AS author_name
//       FROM TaskRemarks r
//       INNER JOIN Tasks t ON t.task_id = r.task_id
//       INNER JOIN Users u ON u.user_id = r.user_id
//       ORDER BY r.created_at DESC
//     `),
//     pool.request().query(`
//       SELECT TOP 15 t.task_id, t.task_title, t.status, t.priority, t.due_date,
//              u.full_name AS assigned_user_name, p.project_name
//       FROM Tasks t
//       LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//       LEFT JOIN Projects p ON p.project_id = t.project_id
//       WHERE t.status <> 'Done' AND t.due_date < CAST(SYSUTCDATETIME() AS DATE)
//       ORDER BY t.due_date ASC, t.priority DESC
//     `)
//   ]);

//   return res.json({
//     summary: summary.recordset[0] || {},
//     recent_activity: recentActivity.recordset,
//     recent_comments: recentComments.recordset,
//     recent_remarks: recentRemarks.recordset,
//     overdue_tasks: overdueTasks.recordset,
//     active_users: getActiveUsers()
//   });
// });

// const getCachedDashboardData = async (userId = null) => {
//   const key = userId ? `user:${userId}` : 'admin';
//   const cached = dashboardCache.get(key);

//   if (cached && cached.expiresAt > Date.now()) {
//     return {
//       ...cached.data,
//       active_users: getActiveUsers()
//     };
//   }

//   const data = await buildDashboardData(userId);
//   dashboardCache.set(key, {
//     data,
//     expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS
//   });
//   return data;
// };

// const buildDashboardData = async (userId = null) => {
//   const pool = await getPool();
//   const scope = userId ? 'WHERE t.assigned_user_id = @user_id' : '';

//   const overviewRequest = pool.request();
//   if (userId) overviewRequest.input('user_id', sql.Int, userId);
//   const overview = await overviewRequest.query(`
//     SELECT
//       COUNT(*) AS total_tasks,
//       SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_tasks,
//       SUM(CASE WHEN t.status IN ('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing') THEN 1 ELSE 0 END) AS pending_tasks,
//       SUM(CASE WHEN t.status = 'Blocked' THEN 1 ELSE 0 END) AS blocked_tasks,
//       SUM(CASE WHEN t.due_date < CAST(SYSUTCDATETIME() AS DATE) AND t.status <> 'Done' THEN 1 ELSE 0 END) AS overdue_tasks
//     FROM Tasks t
//     ${scope}
//   `);

//   const row = overview.recordset[0] || {};
//   const totalTasks = Number(row.total_tasks || 0);
//   const completedTasks = Number(row.completed_tasks || 0);
//   const overviewData = {
//     total_tasks: totalTasks,
//     completed_tasks: completedTasks,
//     pending_tasks: Number(row.pending_tasks || 0),
//     blocked_tasks: Number(row.blocked_tasks || 0),
//     overdue_tasks: Number(row.overdue_tasks || 0),
//     progress_percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
//   };

//   const statusWise = await runScopedQuery(pool, userId, `
//     SELECT t.status AS name, COUNT(*) AS value
//     FROM Tasks t
//     {{scope}}
//     GROUP BY t.status
//     ORDER BY value DESC
//   `);

//   const priorityWise = await runScopedQuery(pool, userId, `
//     SELECT t.priority AS name, COUNT(*) AS value
//     FROM Tasks t
//     {{scope}}
//     GROUP BY t.priority
//     ORDER BY value DESC
//   `);

//   const projectWise = await runScopedQuery(pool, userId, `
//     SELECT COALESCE(p.project_name, 'Unassigned') AS name, COUNT(*) AS value
//     FROM Tasks t
//     LEFT JOIN Projects p ON p.project_id = t.project_id
//     {{scope}}
//     GROUP BY COALESCE(p.project_name, 'Unassigned')
//     ORDER BY value DESC
//   `);

//   const userWise = userId
//     ? []
//     : await runScopedQuery(pool, null, `
//       SELECT COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name, COUNT(*) AS value
//       FROM Tasks t
//       LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//       GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned')
//       ORDER BY value DESC
//     `);

//   const recentActivity = await runScopedQuery(pool, userId, `
//     SELECT TOP 12 h.history_id, h.task_id, t.task_title, h.change_description, h.changed_at,
//            u.full_name AS changed_by_name
//     FROM TaskHistory h
//     INNER JOIN Tasks t ON t.task_id = h.task_id
//     LEFT JOIN Users u ON u.user_id = h.changed_by
//     {{scope}}
//     ORDER BY h.changed_at DESC
//   `);

//   const taskAging = await runScopedQuery(pool, userId, `
//     SELECT name, value, sort_order
//     FROM (
//       SELECT
//         CASE
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 0 AND 3 THEN '0-3 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 4 AND 7 THEN '4-7 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 8 AND 14 THEN '8-14 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 15 AND 30 THEN '15-30 days'
//           ELSE '30+ days'
//         END AS name,
//         CASE
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 0 AND 3 THEN 1
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 4 AND 7 THEN 2
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 8 AND 14 THEN 3
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 15 AND 30 THEN 4
//           ELSE 5
//         END AS sort_order,
//         COUNT(*) AS value
//       FROM Tasks t
//       {{scope_aging}}
//       GROUP BY
//         CASE
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 0 AND 3 THEN '0-3 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 4 AND 7 THEN '4-7 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 8 AND 14 THEN '8-14 days'
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 15 AND 30 THEN '15-30 days'
//           ELSE '30+ days'
//         END,
//         CASE
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 0 AND 3 THEN 1
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 4 AND 7 THEN 2
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 8 AND 14 THEN 3
//           WHEN DATEDIFF(DAY, CAST(t.created_at AS DATE), CAST(SYSUTCDATETIME() AS DATE)) BETWEEN 15 AND 30 THEN 4
//           ELSE 5
//         END
//     ) buckets
//     ORDER BY sort_order ASC
//   `);

//   const moduleStatusHeatmap = await runScopedQuery(pool, userId, `
//     SELECT
//       COALESCE(t.module_name, 'Unassigned') AS module_name,
//       t.status,
//       COUNT(*) AS value
//     FROM Tasks t
//     {{scope}}
//     GROUP BY COALESCE(t.module_name, 'Unassigned'), t.status
//     ORDER BY module_name ASC, t.status ASC
//   `);

//   const userPriorityWorkload = await runScopedQuery(pool, userId, `
//     SELECT TOP 40
//       COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name,
//       t.priority,
//       COUNT(*) AS value
//     FROM Tasks t
//     LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//     {{scope}}
//     GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned'), t.priority
//     ORDER BY name ASC, value DESC
//   `);

//   const completionTrendRequest = pool.request();
//   if (userId) completionTrendRequest.input('user_id', sql.Int, userId);
//   const completionTrend = await completionTrendRequest.query(`
//     WITH days AS (
//       SELECT CAST(DATEADD(DAY, -6, CAST(SYSUTCDATETIME() AS DATE)) AS DATE) AS day_bucket
//       UNION ALL
//       SELECT DATEADD(DAY, 1, day_bucket)
//       FROM days
//       WHERE day_bucket < CAST(SYSUTCDATETIME() AS DATE)
//     ),
//     opened AS (
//       SELECT CAST(t.created_at AS DATE) AS day_bucket, COUNT(*) AS opened
//       FROM Tasks t
//       WHERE CAST(t.created_at AS DATE) >= DATEADD(DAY, -6, CAST(SYSUTCDATETIME() AS DATE))
//         ${userId ? 'AND t.assigned_user_id = @user_id' : ''}
//       GROUP BY CAST(t.created_at AS DATE)
//     ),
//     completed AS (
//       SELECT CAST(h.changed_at AS DATE) AS day_bucket, COUNT(DISTINCT h.task_id) AS completed
//       FROM TaskHistory h
//       INNER JOIN Tasks t ON t.task_id = h.task_id
//       WHERE h.new_status = 'Done'
//         AND CAST(h.changed_at AS DATE) >= DATEADD(DAY, -6, CAST(SYSUTCDATETIME() AS DATE))
//         ${userId ? 'AND t.assigned_user_id = @user_id' : ''}
//       GROUP BY CAST(h.changed_at AS DATE)
//     )
//     SELECT
//       LEFT(DATENAME(WEEKDAY, d.day_bucket), 3) AS label,
//       COALESCE(o.opened, 0) AS opened,
//       COALESCE(c.completed, 0) AS completed,
//       d.day_bucket AS sort_day
//     FROM days d
//     LEFT JOIN opened o ON o.day_bucket = d.day_bucket
//     LEFT JOIN completed c ON c.day_bucket = d.day_bucket
//     ORDER BY d.day_bucket ASC
//     OPTION (MAXRECURSION 7)
//   `);

//   const completionFunnel = await runScopedQuery(pool, userId, `
//     SELECT stage, value, sort_order
//     FROM (
//       SELECT 'Backlog' AS stage, COUNT(*) AS value, 1 AS sort_order FROM Tasks t WHERE t.status = 'Backlog' {{scope_and}}
//       UNION ALL
//       SELECT 'To Do' AS stage, COUNT(*) AS value, 2 AS sort_order FROM Tasks t WHERE t.status = 'To Do' {{scope_and}}
//       UNION ALL
//       SELECT 'In Progress' AS stage, COUNT(*) AS value, 3 AS sort_order FROM Tasks t WHERE t.status = 'In Progress' {{scope_and}}
//       UNION ALL
//       SELECT 'In Review' AS stage, COUNT(*) AS value, 4 AS sort_order FROM Tasks t WHERE t.status = 'In Review' {{scope_and}}
//       UNION ALL
//       SELECT 'Testing' AS stage, COUNT(*) AS value, 5 AS sort_order FROM Tasks t WHERE t.status = 'Testing' {{scope_and}}
//       UNION ALL
//       SELECT 'Done' AS stage, COUNT(*) AS value, 6 AS sort_order FROM Tasks t WHERE t.status = 'Done' {{scope_and}}
//     ) funnel
//     ORDER BY sort_order ASC
//   `);

//   const riskMatrix = await runScopedQuery(pool, userId, `
//     SELECT TOP 24
//       COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name,
//       SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
//       SUM(CASE WHEN t.due_date < CAST(SYSUTCDATETIME() AS DATE) AND t.status <> 'Done' THEN 1 ELSE 0 END) AS overdue,
//       SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END) AS open_tasks,
//       SUM(CASE WHEN t.priority IN ('High', 'Critical') AND t.status <> 'Done' THEN 1 ELSE 0 END) AS high_priority_open
//     FROM Tasks t
//     LEFT JOIN Users u ON u.user_id = t.assigned_user_id
//     {{scope}}
//     GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned')
//     HAVING SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END) > 0
//     ORDER BY
//       SUM(CASE WHEN t.due_date < CAST(SYSUTCDATETIME() AS DATE) AND t.status <> 'Done' THEN 1 ELSE 0 END) DESC,
//       SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) DESC,
//       SUM(CASE WHEN t.status <> 'Done' THEN 1 ELSE 0 END) DESC
//   `);

//   return {
//     overview: overviewData,
//     user_wise: userWise.recordset || userWise,
//     project_wise: projectWise.recordset || projectWise,
//     status_wise: statusWise.recordset || statusWise,
//     priority_wise: priorityWise.recordset || priorityWise,
//     recent_activity: recentActivity.recordset || recentActivity,
//     task_aging: taskAging.recordset || taskAging,
//     module_status_heatmap: moduleStatusHeatmap.recordset || moduleStatusHeatmap,
//     user_priority_workload: userPriorityWorkload.recordset || userPriorityWorkload,
//     completion_trend: completionTrend.recordset || completionTrend,
//     completion_funnel: completionFunnel.recordset || completionFunnel,
//     risk_matrix: riskMatrix.recordset || riskMatrix,
//     active_users: getActiveUsers()
//   };
// };

// const runScopedQuery = async (pool, userId, query) => {
//   const request = pool.request();
//   let scopedQuery = query;
//   if (userId) {
//     request.input('user_id', sql.Int, userId);
//     scopedQuery = scopedQuery.replaceAll('{{scope}}', 'WHERE t.assigned_user_id = @user_id');
//     scopedQuery = scopedQuery.replaceAll('{{scope_and}}', 'AND t.assigned_user_id = @user_id');
//     scopedQuery = scopedQuery.replaceAll('{{scope_aging}}', "WHERE t.assigned_user_id = @user_id AND t.status <> 'Done'");
//   } else {
//     scopedQuery = scopedQuery.replaceAll('{{scope}}', '');
//     scopedQuery = scopedQuery.replaceAll('{{scope_and}}', '');
//     scopedQuery = scopedQuery.replaceAll('{{scope_aging}}', "WHERE t.status <> 'Done'");
//   }
//   return request.query(scopedQuery);
// };


import { getPool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getActiveUsers } from '../utils/activeUsers.js';

const DASHBOARD_CACHE_TTL_MS = Number(process.env.DASHBOARD_CACHE_TTL_MS || 30 * 1000);
const dashboardCache = new Map();

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const data = await getCachedDashboardData();
  return res.json(data);
});

export const getUserDashboard = asyncHandler(async (req, res) => {
  const data = await getCachedDashboardData(req.user.role_name === 'presenter' ? null : req.user.user_id);
  return res.json(data);
});

export const getActiveDashboardUsers = asyncHandler(async (_req, res) => {
  return res.json({ active_users: getActiveUsers() });
});

export const getAdminActivityCenter = asyncHandler(async (_req, res) => {
  const pool = await getPool();
  const [summary, recentActivity, recentComments, recentRemarks, overdueTasks] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total_tasks,
        SUM(CASE WHEN t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS open_tasks,
        SUM(CASE WHEN t.status = 'Blocked' THEN 1 ELSE 0 END)::int AS blocked_tasks,
        SUM(CASE WHEN t.status <> 'Completed' AND t.due_date < CURRENT_DATE THEN 1 ELSE 0 END)::int AS overdue_tasks,
        SUM(CASE WHEN t.priority IN ('High', 'Critical') AND t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS high_priority_open
      FROM Tasks t
    `),
    pool.query(`
      SELECT h.history_id, h.task_id, t.task_title, h.change_description, h.changed_at,
             u.full_name AS changed_by_name, t.status, t.priority
      FROM TaskHistory h
      INNER JOIN Tasks t ON t.task_id = h.task_id
      LEFT JOIN Users u ON u.user_id = h.changed_by
      ORDER BY h.changed_at DESC
      LIMIT 30
    `),
    pool.query(`
      SELECT c.comment_id, c.task_id, c.comment_text, c.created_at,
             t.task_title, u.full_name AS author_name
      FROM TaskComments c
      INNER JOIN Tasks t ON t.task_id = c.task_id
      INNER JOIN Users u ON u.user_id = c.user_id
      ORDER BY c.created_at DESC
      LIMIT 12
    `),
    pool.query(`
      SELECT r.remark_id, r.task_id, r.remark_text, r.remark_date, r.created_at,
             t.task_title, u.full_name AS author_name
      FROM TaskRemarks r
      INNER JOIN Tasks t ON t.task_id = r.task_id
      INNER JOIN Users u ON u.user_id = r.user_id
      ORDER BY r.created_at DESC
      LIMIT 12
    `),
    pool.query(`
      SELECT t.task_id, t.task_title, t.status, t.priority, t.due_date,
             u.full_name AS assigned_user_name, p.project_name
      FROM Tasks t
      LEFT JOIN Users u ON u.user_id = t.assigned_user_id
      LEFT JOIN Projects p ON p.project_id = t.project_id
      WHERE t.status <> 'Completed' AND t.due_date < CURRENT_DATE
      ORDER BY t.due_date ASC, t.priority DESC
      LIMIT 15
    `)
  ]);

  return res.json({
    summary: summary.rows[0] || {},
    recent_activity: recentActivity.rows,
    recent_comments: recentComments.rows,
    recent_remarks: recentRemarks.rows,
    overdue_tasks: overdueTasks.rows,
    active_users: getActiveUsers()
  });
});

const getCachedDashboardData = async (userId = null) => {
  const key = userId ? `user:${userId}` : 'admin';
  const cached = dashboardCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.data,
      active_users: getActiveUsers()
    };
  }

  const data = await buildDashboardData(userId);
  dashboardCache.set(key, {
    data,
    expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS
  });
  return data;
};

const buildDashboardData = async (userId = null) => {
  const pool = await getPool();
  const params = userId ? [userId] : [];
  const scope = userId ? 'WHERE t.assigned_user_id = $1' : '';

  const overview = await pool.query(
    `
      SELECT
        COUNT(*)::int AS total_tasks,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END)::int AS completed_tasks,
        SUM(CASE WHEN t.status IN ('Backlog', 'To Do', 'In Progress', 'In Review', 'Testing') THEN 1 ELSE 0 END)::int AS pending_tasks,
        SUM(CASE WHEN t.status = 'Blocked' THEN 1 ELSE 0 END)::int AS blocked_tasks,
        SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS overdue_tasks
      FROM Tasks t
      ${scope}
    `,
    params
  );

  const row = overview.rows[0] || {};
  const totalTasks = Number(row.total_tasks || 0);
  const completedTasks = Number(row.completed_tasks || 0);
  const overviewData = {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    pending_tasks: Number(row.pending_tasks || 0),
    blocked_tasks: Number(row.blocked_tasks || 0),
    overdue_tasks: Number(row.overdue_tasks || 0),
    progress_percentage: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
  };

  const statusWise = await runScopedQuery(pool, userId, `
    SELECT t.status AS name, COUNT(*)::int AS value
    FROM Tasks t
    {{scope}}
    GROUP BY t.status
    ORDER BY value DESC
  `);

  const priorityWise = await runScopedQuery(pool, userId, `
    SELECT t.priority AS name, COUNT(*)::int AS value
    FROM Tasks t
    {{scope}}
    GROUP BY t.priority
    ORDER BY value DESC
  `);

  const projectWise = await runScopedQuery(pool, userId, `
    SELECT COALESCE(p.project_name, 'Unassigned') AS name, COUNT(*)::int AS value
    FROM Tasks t
    LEFT JOIN Projects p ON p.project_id = t.project_id
    {{scope}}
    GROUP BY COALESCE(p.project_name, 'Unassigned')
    ORDER BY value DESC
  `);

  const userWise = userId
    ? []
    : await runScopedQuery(pool, null, `
      SELECT COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name, COUNT(*)::int AS value
      FROM Tasks t
      LEFT JOIN Users u ON u.user_id = t.assigned_user_id
      GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned')
      ORDER BY value DESC
    `);

  const recentActivity = await runScopedQuery(pool, userId, `
    SELECT h.history_id, h.task_id, t.task_title, h.change_description, h.changed_at,
           u.full_name AS changed_by_name
    FROM TaskHistory h
    INNER JOIN Tasks t ON t.task_id = h.task_id
    LEFT JOIN Users u ON u.user_id = h.changed_by
    {{scope}}
    ORDER BY h.changed_at DESC
    LIMIT 12
  `);

  const taskAging = await runScopedQuery(pool, userId, `
    SELECT name, value, sort_order
    FROM (
      SELECT
        CASE
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 0 AND 3 THEN '0-3 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 4 AND 7 THEN '4-7 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 8 AND 14 THEN '8-14 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 15 AND 30 THEN '15-30 days'
          ELSE '30+ days'
        END AS name,
        CASE
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 0 AND 3 THEN 1
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 4 AND 7 THEN 2
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 8 AND 14 THEN 3
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 15 AND 30 THEN 4
          ELSE 5
        END AS sort_order,
        COUNT(*)::int AS value
      FROM Tasks t
      {{scope_aging}}
      GROUP BY
        CASE
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 0 AND 3 THEN '0-3 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 4 AND 7 THEN '4-7 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 8 AND 14 THEN '8-14 days'
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 15 AND 30 THEN '15-30 days'
          ELSE '30+ days'
        END,
        CASE
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 0 AND 3 THEN 1
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 4 AND 7 THEN 2
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 8 AND 14 THEN 3
          WHEN (CURRENT_DATE - t.created_at::date) BETWEEN 15 AND 30 THEN 4
          ELSE 5
        END
    ) buckets
    ORDER BY sort_order ASC
  `);

  const moduleStatusHeatmap = await runScopedQuery(pool, userId, `
    SELECT
      COALESCE(t.module_name, 'Unassigned') AS module_name,
      t.status,
      COUNT(*)::int AS value
    FROM Tasks t
    {{scope}}
    GROUP BY COALESCE(t.module_name, 'Unassigned'), t.status
    ORDER BY module_name ASC, t.status ASC
  `);

  const userPriorityWorkload = await runScopedQuery(pool, userId, `
    SELECT
      COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name,
      t.priority,
      COUNT(*)::int AS value
    FROM Tasks t
    LEFT JOIN Users u ON u.user_id = t.assigned_user_id
    {{scope}}
    GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned'), t.priority
    ORDER BY name ASC, value DESC
    LIMIT 40
  `);

  const completionTrend = await pool.query(
    `
      WITH days AS (
        SELECT day_bucket::date FROM generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        ) AS day_bucket
      ),
      opened AS (
        SELECT t.created_at::date AS day_bucket, COUNT(*)::int AS opened
        FROM Tasks t
        WHERE t.created_at::date >= CURRENT_DATE - INTERVAL '6 days'
          ${userId ? 'AND t.assigned_user_id = $1' : ''}
        GROUP BY t.created_at::date
      ),
      completed AS (
        SELECT h.changed_at::date AS day_bucket, COUNT(DISTINCT h.task_id)::int AS completed
        FROM TaskHistory h
        INNER JOIN Tasks t ON t.task_id = h.task_id
        WHERE h.new_status = 'Completed'
          AND h.changed_at::date >= CURRENT_DATE - INTERVAL '6 days'
          ${userId ? 'AND t.assigned_user_id = $1' : ''}
        GROUP BY h.changed_at::date
      )
      SELECT
        TO_CHAR(d.day_bucket, 'Dy') AS label,
        COALESCE(o.opened, 0)::int AS opened,
        COALESCE(c.completed, 0)::int AS completed,
        d.day_bucket AS sort_day
      FROM days d
      LEFT JOIN opened o ON o.day_bucket = d.day_bucket
      LEFT JOIN completed c ON c.day_bucket = d.day_bucket
      ORDER BY d.day_bucket ASC
    `,
    params
  );

  const completionFunnel = await runScopedQuery(pool, userId, `
    SELECT stage, value, sort_order
    FROM (
      SELECT 'Backlog' AS stage, COUNT(*)::int AS value, 1 AS sort_order FROM Tasks t WHERE t.status = 'Backlog' {{scope_and}}
      UNION ALL
      SELECT 'To Do' AS stage, COUNT(*)::int AS value, 2 AS sort_order FROM Tasks t WHERE t.status = 'To Do' {{scope_and}}
      UNION ALL
      SELECT 'In Progress' AS stage, COUNT(*)::int AS value, 3 AS sort_order FROM Tasks t WHERE t.status = 'In Progress' {{scope_and}}
      UNION ALL
      SELECT 'In Review' AS stage, COUNT(*)::int AS value, 4 AS sort_order FROM Tasks t WHERE t.status = 'In Review' {{scope_and}}
      UNION ALL
      SELECT 'Testing' AS stage, COUNT(*)::int AS value, 5 AS sort_order FROM Tasks t WHERE t.status = 'Testing' {{scope_and}}
      UNION ALL
      SELECT 'Completed' AS stage, COUNT(*)::int AS value, 6 AS sort_order FROM Tasks t WHERE t.status = 'Completed' {{scope_and}}
    ) funnel
    ORDER BY sort_order ASC
  `);

  const riskMatrix = await runScopedQuery(pool, userId, `
    SELECT
      COALESCE(u.full_name, t.employee_name, 'Unassigned') AS name,
      SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END)::int AS in_progress,
      SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS overdue,
      SUM(CASE WHEN t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS open_tasks,
      SUM(CASE WHEN t.priority IN ('High', 'Critical') AND t.status <> 'Completed' THEN 1 ELSE 0 END)::int AS high_priority_open
    FROM Tasks t
    LEFT JOIN Users u ON u.user_id = t.assigned_user_id
    {{scope}}
    GROUP BY COALESCE(u.full_name, t.employee_name, 'Unassigned')
    HAVING SUM(CASE WHEN t.status <> 'Completed' THEN 1 ELSE 0 END) > 0
    ORDER BY
      SUM(CASE WHEN t.due_date < CURRENT_DATE AND t.status <> 'Completed' THEN 1 ELSE 0 END) DESC,
      SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) DESC,
      SUM(CASE WHEN t.status <> 'Completed' THEN 1 ELSE 0 END) DESC
    LIMIT 24
  `);

  return {
    overview: overviewData,
    user_wise: Array.isArray(userWise) ? userWise : userWise.rows,
    project_wise: projectWise.rows,
    status_wise: statusWise.rows,
    priority_wise: priorityWise.rows,
    recent_activity: recentActivity.rows,
    task_aging: taskAging.rows,
    module_status_heatmap: moduleStatusHeatmap.rows,
    user_priority_workload: userPriorityWorkload.rows,
    completion_trend: completionTrend.rows,
    completion_funnel: completionFunnel.rows,
    risk_matrix: riskMatrix.rows,
    active_users: getActiveUsers()
  };
};

const runScopedQuery = async (pool, userId, queryText) => {
  const params = userId ? [userId] : [];
  let scopedQuery = queryText;
  if (userId) {
    scopedQuery = scopedQuery.replaceAll('{{scope}}', 'WHERE t.assigned_user_id = $1');
    scopedQuery = scopedQuery.replaceAll('{{scope_and}}', 'AND t.assigned_user_id = $1');
    scopedQuery = scopedQuery.replaceAll('{{scope_aging}}', "WHERE t.assigned_user_id = $1 AND t.status <> 'Completed'");
  } else {
    scopedQuery = scopedQuery.replaceAll('{{scope}}', '');
    scopedQuery = scopedQuery.replaceAll('{{scope_and}}', '');
    scopedQuery = scopedQuery.replaceAll('{{scope_aging}}', "WHERE t.status <> 'Completed'");
  }
  return pool.query(scopedQuery, params);
};
