// import { getPool, sql } from '../config/db.js';
// import { createNotification } from '../services/notificationService.js';
// import { emitTaskChange } from '../socket.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// const DEFAULT_PAGE_SIZE = 25;
// const MAX_PAGE_SIZE = 100;

// const taskSelect = `
//   SELECT t.task_id, t.task_title, t.description, t.assigned_user_id, t.employee_name,
//          t.status, t.priority, t.project_id, t.module_name, t.start_date, t.end_date,
//          t.due_date, t.onsite_offshore, t.remarks, t.created_by, t.created_at, t.updated_at,
//          assignee.full_name AS assigned_user_name,
//          assignee.email AS assigned_user_email,
//          creator.full_name AS created_by_name,
//          p.project_name
//   FROM Tasks t
//   LEFT JOIN Users assignee ON assignee.user_id = t.assigned_user_id
//   LEFT JOIN Users creator ON creator.user_id = t.created_by
//   LEFT JOIN Projects p ON p.project_id = t.project_id
// `;

// export const getTasks = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const request = pool.request();
//   const where = buildTaskWhere(req, request);
//   const paginated = req.query.page !== undefined || req.query.page_size !== undefined || req.query.pageSize !== undefined;
//   const page = parsePositiveInt(req.query.page, 1);
//   const pageSize = parsePageSize(req.query.page_size ?? req.query.pageSize);
//   const offset = (page - 1) * pageSize;

//   if (paginated) {
//     request.input('offset', sql.Int, offset);
//     request.input('page_size', sql.Int, pageSize);
//   }

//   const result = await request.query(`
//     ${taskSelect}
//     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
//     ORDER BY COALESCE(t.updated_at, t.created_at) DESC
//     ${paginated ? 'OFFSET @offset ROWS FETCH NEXT @page_size ROWS ONLY' : ''}
//   `);

//   if (!paginated) {
//     return res.json({ tasks: result.recordset });
//   }

//   const countRequest = pool.request();
//   const countWhere = buildTaskWhere(req, countRequest);
//   const countResult = await countRequest.query(`
//     SELECT COUNT(*) AS total
//     FROM Tasks t
//     LEFT JOIN Projects p ON p.project_id = t.project_id
//     ${countWhere.length ? `WHERE ${countWhere.join(' AND ')}` : ''}
//   `);
//   const total = Number(countResult.recordset[0]?.total || 0);

//   return res.json({
//     tasks: result.recordset,
//     pagination: {
//       page,
//       page_size: pageSize,
//       total,
//       total_pages: Math.max(1, Math.ceil(total / pageSize))
//     }
//   });
// });

// export const getTaskById = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });
//   await ensureTaskRemarksTable(pool);

//   const comments = await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .query(`
//       SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.full_name, u.email
//       FROM TaskComments c
//       INNER JOIN Users u ON u.user_id = c.user_id
//       WHERE c.task_id = @task_id
//       ORDER BY c.created_at ASC
//     `);

//   const history = await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .query(`
//       SELECT h.history_id, h.old_status, h.new_status, h.old_priority, h.new_priority,
//              h.change_description, h.changed_at, u.full_name AS changed_by_name
//       FROM TaskHistory h
//       LEFT JOIN Users u ON u.user_id = h.changed_by
//       WHERE h.task_id = @task_id
//       ORDER BY h.changed_at DESC
//     `);

//   const dailyRemarks = await fetchTaskRemarks(pool, req.params.id);

//   return res.json({ task, comments: comments.recordset, history: history.recordset, daily_remarks: dailyRemarks });
// });

// export const createTask = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const body = req.body;
//   const isAdmin = req.user.role_name === 'admin';
//   const assignedUserId = isAdmin ? nullableInt(body.assigned_user_id) : req.user.user_id;
//   const employeeName = await resolveEmployeeName(pool, assignedUserId, body.employee_name, req.user.full_name);

//   if (!body.task_title) {
//     return res.status(400).json({ message: 'Task title is required.' });
//   }

//   const result = await pool
//     .request()
//     .input('task_title', sql.NVarChar(255), body.task_title)
//     .input('description', sql.NVarChar(sql.MAX), body.description || null)
//     .input('assigned_user_id', sql.Int, assignedUserId)
//     .input('employee_name', sql.NVarChar(150), employeeName)
//     .input('status', sql.NVarChar(40), body.status || 'To Do')
//     .input('priority', sql.NVarChar(40), body.priority || 'Medium')
//     .input('project_id', sql.Int, nullableInt(body.project_id))
//     .input('module_name', sql.NVarChar(120), body.module_name || null)
//     .input('start_date', sql.Date, nullableDate(body.start_date))
//     .input('end_date', sql.Date, nullableDate(body.end_date))
//     .input('due_date', sql.Date, nullableDate(body.due_date))
//     .input('onsite_offshore', sql.NVarChar(30), body.onsite_offshore || null)
//     .input('remarks', sql.NVarChar(sql.MAX), body.remarks || null)
//     .input('created_by', sql.Int, req.user.user_id)
//     .query(`
//       INSERT INTO Tasks (
//         task_title, description, assigned_user_id, employee_name, status, priority,
//         project_id, module_name, start_date, end_date, due_date, onsite_offshore,
//         remarks, created_by
//       )
//       OUTPUT INSERTED.task_id
//       VALUES (
//         @task_title, @description, @assigned_user_id, @employee_name, @status, @priority,
//         @project_id, @module_name, @start_date, @end_date, @due_date, @onsite_offshore,
//         @remarks, @created_by
//       )
//     `);

//   const taskId = result.recordset[0].task_id;
//   await recordHistory(pool, {
//     taskId,
//     changedBy: req.user.user_id,
//     newStatus: body.status || 'To Do',
//     newPriority: body.priority || 'Medium',
//     description: 'Task created'
//   });

//   const task = await findTaskById(pool, taskId);
//   await notifyAssignedUser(task, req.user.user_id, {
//     type: 'task_assigned',
//     title: 'New task assigned',
//     message: `You were assigned ${formatTaskSummary(task)}.`
//   });
//   emitTaskMutation(task, 'created', req.user.user_id);

//   return res.status(201).json({ task });
// });

// export const updateTask = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const existing = await findAuthorizedTask(pool, req, req.params.id);
//   if (!existing) return res.status(404).json({ message: 'Task not found.' });

//   const body = req.body;
//   const isAdmin = req.user.role_name === 'admin';
//   const nextAssignedUserId = isAdmin
//     ? valueOrExistingInt(body.assigned_user_id, existing.assigned_user_id)
//     : existing.assigned_user_id;
//   const assignmentChanged = Number(nextAssignedUserId || 0) !== Number(existing.assigned_user_id || 0);
//   const statusChanged = Boolean(body.status && body.status !== existing.status);
//   const employeeName = await resolveEmployeeName(
//     pool,
//     nextAssignedUserId,
//     body.employee_name ?? existing.employee_name,
//     existing.employee_name
//   );

//   await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .input('task_title', sql.NVarChar(255), body.task_title ?? existing.task_title)
//     .input('description', sql.NVarChar(sql.MAX), body.description ?? existing.description)
//     .input('assigned_user_id', sql.Int, nextAssignedUserId)
//     .input('employee_name', sql.NVarChar(150), employeeName)
//     .input('status', sql.NVarChar(40), body.status ?? existing.status)
//     .input('priority', sql.NVarChar(40), body.priority ?? existing.priority)
//     .input('project_id', sql.Int, valueOrExistingInt(body.project_id, existing.project_id))
//     .input('module_name', sql.NVarChar(120), body.module_name ?? existing.module_name)
//     .input('start_date', sql.Date, valueOrExistingDate(body.start_date, existing.start_date))
//     .input('end_date', sql.Date, valueOrExistingDate(body.end_date, existing.end_date))
//     .input('due_date', sql.Date, valueOrExistingDate(body.due_date, existing.due_date))
//     .input('onsite_offshore', sql.NVarChar(30), body.onsite_offshore ?? existing.onsite_offshore)
//     .input('remarks', sql.NVarChar(sql.MAX), body.remarks ?? existing.remarks)
//     .query(`
//       UPDATE Tasks
//       SET task_title = @task_title,
//           description = @description,
//           assigned_user_id = @assigned_user_id,
//           employee_name = @employee_name,
//           status = @status,
//           priority = @priority,
//           project_id = @project_id,
//           module_name = @module_name,
//           start_date = @start_date,
//           end_date = @end_date,
//           due_date = @due_date,
//           onsite_offshore = @onsite_offshore,
//           remarks = @remarks,
//           updated_at = SYSUTCDATETIME()
//       WHERE task_id = @task_id
//     `);

//   if ((body.status && body.status !== existing.status) || (body.priority && body.priority !== existing.priority)) {
//     await recordHistory(pool, {
//       taskId: req.params.id,
//       changedBy: req.user.user_id,
//       oldStatus: existing.status,
//       newStatus: body.status ?? existing.status,
//       oldPriority: existing.priority,
//       newPriority: body.priority ?? existing.priority,
//       description: 'Task updated'
//     });
//   }

//   const task = await findTaskById(pool, req.params.id);
//   if (assignmentChanged) {
//     await notifyAssignedUser(task, req.user.user_id, {
//       type: 'task_assigned',
//       title: 'Task reassigned to you',
//       message: `You were assigned ${formatTaskSummary(task)}.`
//     });
//   } else if (statusChanged) {
//     await notifyAssignedUser(task, req.user.user_id, {
//       type: 'task_status_changed',
//       title: 'Task status changed',
//       message: `${task.task_title} moved from ${existing.status} to ${task.status}.`
//     });
//   }
//   emitTaskMutation(task, 'updated', req.user.user_id, [existing.assigned_user_id]);

//   return res.json({ task });
// });

// export const deleteTask = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const existing = await findAuthorizedTask(pool, req, req.params.id);
//   if (!existing) return res.status(404).json({ message: 'Task not found.' });

//   await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .query('DELETE FROM Tasks WHERE task_id = @task_id');
//   emitTaskChange({
//     action: 'deleted',
//     taskId: Number(req.params.id),
//     userIds: [req.user.user_id, existing.assigned_user_id]
//   });

//   return res.json({ message: 'Task deleted successfully.' });
// });

// export const updateTaskStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   if (!status) return res.status(400).json({ message: 'Status is required.' });

//   const pool = await getPool();
//   const existing = await findAuthorizedTask(pool, req, req.params.id);
//   if (!existing) return res.status(404).json({ message: 'Task not found.' });

//   await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .input('status', sql.NVarChar(40), status)
//     .query('UPDATE Tasks SET status = @status, updated_at = SYSUTCDATETIME() WHERE task_id = @task_id');

//   if (status !== existing.status) {
//     await recordHistory(pool, {
//       taskId: req.params.id,
//       changedBy: req.user.user_id,
//       oldStatus: existing.status,
//       newStatus: status,
//       oldPriority: existing.priority,
//       newPriority: existing.priority,
//       description: `Status changed from ${existing.status} to ${status}`
//     });
//   }

//   const task = await findTaskById(pool, req.params.id);
//   if (status !== existing.status) {
//     await notifyAssignedUser(task, req.user.user_id, {
//       type: 'task_status_changed',
//       title: 'Task status changed',
//       message: `${task.task_title} moved from ${existing.status} to ${task.status}.`
//     });
//   }
//   emitTaskMutation(task, 'status_changed', req.user.user_id, [existing.assigned_user_id]);

//   return res.json({ task });
// });

// export const updateTaskPriority = asyncHandler(async (req, res) => {
//   const { priority } = req.body;
//   if (!priority) return res.status(400).json({ message: 'Priority is required.' });

//   const pool = await getPool();
//   const existing = await findAuthorizedTask(pool, req, req.params.id);
//   if (!existing) return res.status(404).json({ message: 'Task not found.' });

//   await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .input('priority', sql.NVarChar(40), priority)
//     .query('UPDATE Tasks SET priority = @priority, updated_at = SYSUTCDATETIME() WHERE task_id = @task_id');

//   if (priority !== existing.priority) {
//     await recordHistory(pool, {
//       taskId: req.params.id,
//       changedBy: req.user.user_id,
//       oldStatus: existing.status,
//       newStatus: existing.status,
//       oldPriority: existing.priority,
//       newPriority: priority,
//       description: `Priority changed from ${existing.priority} to ${priority}`
//     });
//   }

//   const task = await findTaskById(pool, req.params.id);
//   emitTaskMutation(task, 'priority_changed', req.user.user_id, [existing.assigned_user_id]);
//   return res.json({ task });
// });

// export const getComments = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   const result = await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .query(`
//       SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.full_name, u.email
//       FROM TaskComments c
//       INNER JOIN Users u ON u.user_id = c.user_id
//       WHERE c.task_id = @task_id
//       ORDER BY c.created_at ASC
//     `);

//   return res.json({ comments: result.recordset });
// });

// export const addComment = asyncHandler(async (req, res) => {
//   const { comment_text } = req.body;
//   if (!comment_text) return res.status(400).json({ message: 'Comment text is required.' });

//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   const result = await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .input('user_id', sql.Int, req.user.user_id)
//     .input('comment_text', sql.NVarChar(sql.MAX), comment_text)
//     .query(`
//       INSERT INTO TaskComments (task_id, user_id, comment_text)
//       OUTPUT INSERTED.comment_id, INSERTED.task_id, INSERTED.user_id,
//              INSERTED.comment_text, INSERTED.created_at
//       VALUES (@task_id, @user_id, @comment_text)
//     `);

//   await recordHistory(pool, {
//     taskId: req.params.id,
//     changedBy: req.user.user_id,
//     oldStatus: task.status,
//     newStatus: task.status,
//     oldPriority: task.priority,
//     newPriority: task.priority,
//     description: 'Comment added'
//   });

//   const comment = result.recordset[0];
//   await notifyAssignedUser(task, req.user.user_id, {
//     type: 'comment_added',
//     title: 'New task comment',
//     message: `${req.user.full_name} commented on ${formatTaskSummary(task)}.`
//   });
//   emitTaskMutation(task, 'comment_added', req.user.user_id);

//   return res.status(201).json({ comment });
// });

// export const getTaskRemarks = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   await ensureTaskRemarksTable(pool);
//   const remarks = await fetchTaskRemarks(pool, req.params.id);
//   return res.json({ remarks });
// });

// export const addTaskRemark = asyncHandler(async (req, res) => {
//   const { remark_date, remark_text } = req.body;
//   if (!remark_text?.trim()) return res.status(400).json({ message: 'Remark text is required.' });

//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   await ensureTaskRemarksTable(pool);
//   const remarkDate = nullableDate(remark_date) || new Date();
//   const result = await pool
//     .request()
//     .input('task_id', sql.Int, req.params.id)
//     .input('user_id', sql.Int, req.user.user_id)
//     .input('remark_date', sql.Date, remarkDate)
//     .input('remark_text', sql.NVarChar(sql.MAX), remark_text.trim())
//     .query(`
//       INSERT INTO TaskRemarks (task_id, user_id, remark_date, remark_text)
//       OUTPUT INSERTED.remark_id
//       VALUES (@task_id, @user_id, @remark_date, @remark_text)
//     `);

//   const remarkId = result.recordset[0].remark_id;
//   await recordHistory(pool, {
//     taskId: req.params.id,
//     changedBy: req.user.user_id,
//     oldStatus: task.status,
//     newStatus: task.status,
//     oldPriority: task.priority,
//     newPriority: task.priority,
//     description: `Daily remark added for ${toSqlDateString(remarkDate)}`
//   });

//   const remark = await fetchTaskRemarkById(pool, remarkId);
//   await notifyAssignedUser(task, req.user.user_id, {
//     type: 'remark_added',
//     title: 'New task remark',
//     message: `${req.user.full_name} added a remark on ${formatTaskSummary(task)}.`
//   });
//   emitTaskMutation(task, 'remark_added', req.user.user_id);

//   return res.status(201).json({ remark });
// });

// export const updateTaskRemark = asyncHandler(async (req, res) => {
//   const { remark_date, remark_text } = req.body;
//   if (!remark_text?.trim()) return res.status(400).json({ message: 'Remark text is required.' });

//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   const remarkId = req.params.remark_id;
//   const existingRemark = await fetchTaskRemarkById(pool, remarkId);
//   if (!existingRemark || existingRemark.task_id != req.params.id) {
//     return res.status(404).json({ message: 'Remark not found.' });
//   }

//   const remarkDate = nullableDate(remark_date) || new Date();
  
//   await pool
//     .request()
//     .input('remark_id', sql.Int, remarkId)
//     .input('remark_date', sql.Date, remarkDate)
//     .input('remark_text', sql.NVarChar(sql.MAX), remark_text.trim())
//     .query(`
//       UPDATE TaskRemarks 
//       SET remark_date = @remark_date, remark_text = @remark_text, updated_at = SYSUTCDATETIME()
//       WHERE remark_id = @remark_id
//     `);

//   await recordHistory(pool, {
//     taskId: req.params.id,
//     changedBy: req.user.user_id,
//     oldStatus: task.status,
//     newStatus: task.status,
//     oldPriority: task.priority,
//     newPriority: task.priority,
//     description: `Daily remark updated for ${toSqlDateString(remarkDate)}`
//   });

//   const remark = await fetchTaskRemarkById(pool, remarkId);
//   emitTaskMutation(task, 'remark_updated', req.user.user_id);
//   return res.json({ remark });
// });

// export const deleteTaskRemark = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const task = await findAuthorizedTask(pool, req, req.params.id);
//   if (!task) return res.status(404).json({ message: 'Task not found.' });

//   const remarkId = req.params.remark_id;
//   const existingRemark = await fetchTaskRemarkById(pool, remarkId);
//   if (!existingRemark || existingRemark.task_id != req.params.id) {
//     return res.status(404).json({ message: 'Remark not found.' });
//   }

//   await pool
//     .request()
//     .input('remark_id', sql.Int, remarkId)
//     .query('DELETE FROM TaskRemarks WHERE remark_id = @remark_id');

//   await recordHistory(pool, {
//     taskId: req.params.id,
//     changedBy: req.user.user_id,
//     oldStatus: task.status,
//     newStatus: task.status,
//     oldPriority: task.priority,
//     newPriority: task.priority,
//     description: `Daily remark deleted for ${toSqlDateString(existingRemark.remark_date)}`
//   });
//   emitTaskMutation(task, 'remark_deleted', req.user.user_id);

//   return res.json({ message: 'Remark deleted successfully.' });
// });

// const buildTaskWhere = (req, request) => {
//   const where = [];
//   const q = req.query;
//   const isAdmin = req.user.role_name === 'admin';
//   const canViewAll = isAdmin || req.user.role_name === 'presenter';

//   if (!canViewAll) {
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
//   if (q.date) {
//     request.input('date', sql.Date, nullableDate(q.date));
//     where.push('t.due_date = @date');
//   } else if (q.date_from) {
//     request.input('date_from', sql.Date, nullableDate(q.date_from));
//     where.push('t.due_date >= @date_from');
//   }
//   if (!q.date && q.date_to) {
//     request.input('date_to', sql.Date, nullableDate(q.date_to));
//     where.push('t.due_date <= @date_to');
//   }
//   if (q.search) {
//     request.input('search', sql.NVarChar(255), `%${q.search}%`);
//     where.push('(t.task_title LIKE @search OR t.description LIKE @search OR t.remarks LIKE @search OR t.employee_name LIKE @search OR p.project_name LIKE @search)');
//   }

//   return where;
// };

// const findAuthorizedTask = async (pool, req, taskId) => {
//   const task = await findTaskById(pool, taskId);
//   if (!task) return null;
//   if (!['admin', 'presenter'].includes(req.user.role_name) && task.assigned_user_id !== req.user.user_id) {
//     return null;
//   }
//   return task;
// };

// const findTaskById = async (pool, taskId) => {
//   const result = await pool
//     .request()
//     .input('task_id', sql.Int, taskId)
//     .query(`${taskSelect} WHERE t.task_id = @task_id`);
//   return result.recordset[0] || null;
// };

// const recordHistory = async (pool, history) => {
//   await pool
//     .request()
//     .input('task_id', sql.Int, history.taskId)
//     .input('changed_by', sql.Int, history.changedBy)
//     .input('old_status', sql.NVarChar(40), history.oldStatus || null)
//     .input('new_status', sql.NVarChar(40), history.newStatus || null)
//     .input('old_priority', sql.NVarChar(40), history.oldPriority || null)
//     .input('new_priority', sql.NVarChar(40), history.newPriority || null)
//     .input('change_description', sql.NVarChar(sql.MAX), history.description || null)
//     .query(`
//       INSERT INTO TaskHistory (
//         task_id, changed_by, old_status, new_status, old_priority, new_priority, change_description
//       )
//       VALUES (
//         @task_id, @changed_by, @old_status, @new_status, @old_priority, @new_priority, @change_description
//       )
//     `);
// };

// const ensureTaskRemarksTable = async (pool) => {
//   await pool.request().query(`
//     IF OBJECT_ID(N'TaskRemarks', N'U') IS NULL
//     BEGIN
//       CREATE TABLE TaskRemarks (
//         remark_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_TaskRemarks PRIMARY KEY,
//         task_id INT NOT NULL,
//         user_id INT NOT NULL,
//         remark_date DATE NOT NULL,
//         remark_text NVARCHAR(MAX) NOT NULL,
//         created_at DATETIME2(0) NOT NULL CONSTRAINT DF_TaskRemarks_created_at DEFAULT SYSUTCDATETIME(),
//         updated_at DATETIME2(0) NULL,
//         CONSTRAINT FK_TaskRemarks_Tasks FOREIGN KEY (task_id) REFERENCES Tasks(task_id) ON DELETE CASCADE,
//         CONSTRAINT FK_TaskRemarks_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
//       );

//       CREATE INDEX IX_TaskRemarks_task_date ON TaskRemarks(task_id, remark_date DESC, created_at DESC);
//     END
//   `);
// };

// const fetchTaskRemarks = async (pool, taskId) => {
//   const result = await pool
//     .request()
//     .input('task_id', sql.Int, taskId)
//     .query(`
//       SELECT r.remark_id, r.task_id, r.user_id, r.remark_date, r.remark_text, r.created_at, r.updated_at,
//              u.full_name, u.email
//       FROM TaskRemarks r
//       INNER JOIN Users u ON u.user_id = r.user_id
//       WHERE r.task_id = @task_id
//       ORDER BY r.remark_date DESC, r.created_at DESC
//     `);
//   return result.recordset;
// };

// const fetchTaskRemarkById = async (pool, remarkId) => {
//   const result = await pool
//     .request()
//     .input('remark_id', sql.Int, remarkId)
//     .query(`
//       SELECT r.remark_id, r.task_id, r.user_id, r.remark_date, r.remark_text, r.created_at, r.updated_at,
//              u.full_name, u.email
//       FROM TaskRemarks r
//       INNER JOIN Users u ON u.user_id = r.user_id
//       WHERE r.remark_id = @remark_id
//     `);
//   return result.recordset[0] || null;
// };

// const notifyAssignedUser = async (task, actorUserId, notification) => {
//   if (!task?.assigned_user_id || Number(task.assigned_user_id) === Number(actorUserId)) return;

//   await notifyUserSafely({
//     userId: task.assigned_user_id,
//     relatedTaskId: task.task_id,
//     ...notification
//   });
// };

// const notifyUserSafely = async (payload) => {
//   try {
//     await createNotification(payload);
//   } catch (error) {
//     if (process.env.NODE_ENV !== 'test') {
//       console.error('Failed to create notification:', error);
//     }
//   }
// };

// const emitTaskMutation = (task, action, actorUserId, extraUserIds = []) => {
//   emitTaskChange({
//     task,
//     action,
//     userIds: [actorUserId, ...extraUserIds]
//   });
// };

// const formatTaskSummary = (task) => {
//   if (!task) return 'a task';
//   const meta = [task.project_name, task.module_name].filter(Boolean).join(' / ');
//   return meta ? `${task.task_title} (${meta})` : task.task_title;
// };

// const resolveEmployeeName = async (pool, userId, fallbackName, defaultName) => {
//   if (!userId) return fallbackName || defaultName || null;
//   const result = await pool
//     .request()
//     .input('user_id', sql.Int, userId)
//     .query('SELECT full_name FROM Users WHERE user_id = @user_id');
//   return result.recordset[0]?.full_name || fallbackName || defaultName || null;
// };

// const nullableInt = (value) => {
//   if (value === undefined || value === null || value === '') return null;
//   return Number(value);
// };

// const parsePositiveInt = (value, fallback) => {
//   const parsed = Number(value);
//   return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
// };

// const parsePageSize = (value) => Math.min(parsePositiveInt(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

// const valueOrExistingInt = (value, existing) => {
//   if (value === undefined) return existing;
//   return nullableInt(value);
// };

// const nullableDate = (value) => {
//   if (!value) return null;
//   const date = value instanceof Date ? value : new Date(value);
//   return Number.isNaN(date.getTime()) ? null : date;
// };

// const valueOrExistingDate = (value, existing) => {
//   if (value === undefined) return existing;
//   return nullableDate(value);
// };

// const toSqlDateString = (value) => {
//   const date = value instanceof Date ? value : new Date(value);
//   if (Number.isNaN(date.getTime())) return '';
//   return date.toISOString().slice(0, 10);
// };


import fs from 'node:fs';
import path from 'node:path';
import { getPool } from '../config/db.js';
import { createNotification } from '../services/notificationService.js';
import { emitTaskChange } from '../socket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const taskSelect = `
  SELECT t.task_id, t.task_title, t.description, t.assigned_user_id, t.employee_name,
         t.status, t.priority, t.project_id, t.module_name, t.start_date, t.end_date,
         t.due_date, t.onsite_offshore, t.remarks, t.story_points, t.created_by, t.created_at, t.updated_at,
         assignee.full_name AS assigned_user_name,
         assignee.email AS assigned_user_email,
         creator.full_name AS created_by_name,
         p.project_name
  FROM Tasks t
  LEFT JOIN Users assignee ON assignee.user_id = t.assigned_user_id
  LEFT JOIN Users creator ON creator.user_id = t.created_by
  LEFT JOIN Projects p ON p.project_id = t.project_id
`;

export const getTasks = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const params = [];
  const where = buildTaskWhere(req, params);
  const paginated = req.query.page !== undefined || req.query.page_size !== undefined || req.query.pageSize !== undefined;
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePageSize(req.query.page_size ?? req.query.pageSize);
  const offset = (page - 1) * pageSize;

  let limitClause = '';
  if (paginated) {
    params.push(pageSize);
    const limitParamIdx = params.length;
    params.push(offset);
    const offsetParamIdx = params.length;
    limitClause = `LIMIT $${limitParamIdx} OFFSET $${offsetParamIdx}`;
  }

  const result = await pool.query(
    `
      ${taskSelect}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY COALESCE(t.updated_at, t.created_at) DESC
      ${limitClause}
    `,
    params
  );

  if (!paginated) {
    return res.json({ tasks: result.rows });
  }

  const countParams = [];
  const countWhere = buildTaskWhere(req, countParams);
  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM Tasks t
      LEFT JOIN Projects p ON p.project_id = t.project_id
      ${countWhere.length ? `WHERE ${countWhere.join(' AND ')}` : ''}
    `,
    countParams
  );
  const total = Number(countResult.rows[0]?.total || 0);

  return res.json({
    tasks: result.rows,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize))
    }
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  await ensureTaskRemarksTable(pool);

  const comments = await pool.query(
    `
      SELECT c.comment_id, c.comment_text, c.created_at, u.user_id, u.full_name, u.email
      FROM TaskComments c
      INNER JOIN Users u ON u.user_id = c.user_id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `,
    [req.params.id]
  );

  const history = await pool.query(
    `
      SELECT h.history_id, h.old_status, h.new_status, h.old_priority, h.new_priority,
             h.change_description, h.changed_at, u.full_name AS changed_by_name
      FROM TaskHistory h
      LEFT JOIN Users u ON u.user_id = h.changed_by
      WHERE h.task_id = $1
      ORDER BY h.changed_at DESC
    `,
    [req.params.id]
  );

  const dailyRemarks = await fetchTaskRemarks(pool, req.params.id);

  return res.json({ task, comments: comments.rows, history: history.rows, daily_remarks: dailyRemarks });
});

export const createTask = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const body = req.body;
  const isAdmin = req.user.role_name === 'admin';
  const assignedUserId = isAdmin ? nullableInt(body.assigned_user_id) : req.user.user_id;
  const employeeName = await resolveEmployeeName(pool, assignedUserId, body.employee_name, req.user.full_name);

  if (!body.task_title) {
    return res.status(400).json({ message: 'Task title is required.' });
  }

  const result = await pool.query(
    `
      INSERT INTO Tasks (
        task_title, description, assigned_user_id, employee_name, status, priority,
        project_id, module_name, start_date, end_date, due_date, onsite_offshore,
        remarks, story_points, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING task_id
    `,
    [
      body.task_title,
      body.description || null,
      assignedUserId,
      employeeName,
      body.status || 'To Do',
      body.priority || 'Medium',
      nullableInt(body.project_id),
      body.module_name || null,
      nullableDate(body.start_date),
      nullableDate(body.end_date),
      nullableDate(body.due_date),
      body.onsite_offshore || null,
      body.remarks || null,
      parsePositiveInt(body.story_points, 1),
      req.user.user_id
    ]
  );

  const taskId = result.rows[0].task_id;
  await recordHistory(pool, {
    taskId,
    changedBy: req.user.user_id,
    newStatus: body.status || 'To Do',
    newPriority: body.priority || 'Medium',
    description: 'Task created'
  });

  const task = await findTaskById(pool, taskId);
  await notifyAssignedUser(task, req.user.user_id, {
    type: 'task_assigned',
    title: 'New task assigned',
    message: `You were assigned ${formatTaskSummary(task)}.`
  });
  emitTaskMutation(task, 'created', req.user.user_id);

  return res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const existing = await findAuthorizedTask(pool, req, req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found.' });

  const body = req.body;
  const isAdmin = req.user.role_name === 'admin';
  const nextAssignedUserId = isAdmin
    ? valueOrExistingInt(body.assigned_user_id, existing.assigned_user_id)
    : existing.assigned_user_id;
  const assignmentChanged = Number(nextAssignedUserId || 0) !== Number(existing.assigned_user_id || 0);
  const statusChanged = Boolean(body.status && body.status !== existing.status);
  const employeeName = await resolveEmployeeName(
    pool,
    nextAssignedUserId,
    body.employee_name ?? existing.employee_name,
    existing.employee_name
  );

  await pool.query(
    `
      UPDATE Tasks
      SET task_title = $1,
          description = $2,
          assigned_user_id = $3,
          employee_name = $4,
          status = $5,
          priority = $6,
          project_id = $7,
          module_name = $8,
          start_date = $9,
          end_date = $10,
          due_date = $11,
          onsite_offshore = $12,
          remarks = $13,
          story_points = $14,
          updated_at = CURRENT_TIMESTAMP
      WHERE task_id = $15
    `,
    [
      body.task_title ?? existing.task_title,
      body.description ?? existing.description,
      nextAssignedUserId,
      employeeName,
      body.status ?? existing.status,
      body.priority ?? existing.priority,
      valueOrExistingInt(body.project_id, existing.project_id),
      body.module_name ?? existing.module_name,
      valueOrExistingDate(body.start_date, existing.start_date),
      valueOrExistingDate(body.end_date, existing.end_date),
      valueOrExistingDate(body.due_date, existing.due_date),
      body.onsite_offshore ?? existing.onsite_offshore,
      body.remarks ?? existing.remarks,
      parsePositiveInt(body.story_points ?? existing.story_points, 1),
      req.params.id
    ]
  );

  if ((body.status && body.status !== existing.status) || (body.priority && body.priority !== existing.priority) || assignmentChanged) {
    const changeDesc = assignmentChanged
      ? `Task reassigned from '${existing.employee_name || 'Unassigned'}' to '${employeeName || 'Unassigned'}'`
      : 'Task updated';

    await recordHistory(pool, {
      taskId: req.params.id,
      changedBy: req.user.user_id,
      oldStatus: existing.status,
      newStatus: body.status ?? existing.status,
      oldPriority: existing.priority,
      newPriority: body.priority ?? existing.priority,
      description: changeDesc
    });
  }

  const task = await findTaskById(pool, req.params.id);
  if (assignmentChanged) {
    await notifyAssignedUser(task, req.user.user_id, {
      type: 'task_assigned',
      title: 'Task reassigned to you',
      message: `You were assigned ${formatTaskSummary(task)}.`
    });
  } else if (statusChanged) {
    await notifyAssignedUser(task, req.user.user_id, {
      type: 'task_status_changed',
      title: 'Task status changed',
      message: `${task.task_title} moved from ${existing.status} to ${task.status}.`
    });
  }
  emitTaskMutation(task, 'updated', req.user.user_id, [existing.assigned_user_id]);

  return res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const existing = await findAuthorizedTask(pool, req, req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found.' });

  await pool.query('DELETE FROM Tasks WHERE task_id = $1', [req.params.id]);
  emitTaskChange({
    action: 'deleted',
    taskId: Number(req.params.id),
    userIds: [req.user.user_id, existing.assigned_user_id]
  });

  return res.json({ message: 'Task deleted successfully.' });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status is required.' });

  const pool = await getPool();
  const existing = await findAuthorizedTask(pool, req, req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found.' });

  await pool.query('UPDATE Tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE task_id = $2', [status, req.params.id]);

  if (status !== existing.status) {
    await recordHistory(pool, {
      taskId: req.params.id,
      changedBy: req.user.user_id,
      oldStatus: existing.status,
      newStatus: status,
      oldPriority: existing.priority,
      newPriority: existing.priority,
      description: `Status changed from ${existing.status} to ${status}`
    });
  }

  const task = await findTaskById(pool, req.params.id);
  if (status !== existing.status) {
    await notifyAssignedUser(task, req.user.user_id, {
      type: 'task_status_changed',
      title: 'Task status changed',
      message: `${task.task_title} moved from ${existing.status} to ${task.status}.`
    });
  }
  emitTaskMutation(task, 'status_changed', req.user.user_id, [existing.assigned_user_id]);

  return res.json({ task });
});

export const updateTaskPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;
  if (!priority) return res.status(400).json({ message: 'Priority is required.' });

  const pool = await getPool();
  const existing = await findAuthorizedTask(pool, req, req.params.id);
  if (!existing) return res.status(404).json({ message: 'Task not found.' });

  await pool.query('UPDATE Tasks SET priority = $1, updated_at = CURRENT_TIMESTAMP WHERE task_id = $2', [priority, req.params.id]);

  if (priority !== existing.priority) {
    await recordHistory(pool, {
      taskId: req.params.id,
      changedBy: req.user.user_id,
      oldStatus: existing.status,
      newStatus: existing.status,
      oldPriority: existing.priority,
      newPriority: priority,
      description: `Priority changed from ${existing.priority} to ${priority}`
    });
  }

  const task = await findTaskById(pool, req.params.id);
  emitTaskMutation(task, 'priority_changed', req.user.user_id, [existing.assigned_user_id]);
  return res.json({ task });
});

export const getComments = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const result = await pool.query(
    `
      SELECT c.comment_id, c.task_id, c.parent_comment_id, c.comment_text, c.created_at,
             u.user_id, u.full_name, u.email, r.role_name AS user_role,
             parent_user.full_name AS parent_user_name
      FROM TaskComments c
      INNER JOIN Users u ON u.user_id = c.user_id
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN TaskComments parent_c ON parent_c.comment_id = c.parent_comment_id
      LEFT JOIN Users parent_user ON parent_user.user_id = parent_c.user_id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `,
    [req.params.id]
  );

  return res.json({ comments: result.rows });
});

export const addComment = asyncHandler(async (req, res) => {
  const { comment_text, parent_comment_id } = req.body;
  if (!comment_text || !comment_text.trim()) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const parentId = parent_comment_id ? Number(parent_comment_id) : null;

  const result = await pool.query(
    `
      INSERT INTO TaskComments (task_id, user_id, comment_text, parent_comment_id)
      VALUES ($1, $2, $3, $4)
      RETURNING comment_id, task_id, user_id, parent_comment_id, comment_text, created_at
    `,
    [req.params.id, req.user.user_id, comment_text.trim(), parentId]
  );

  const newComment = result.rows[0];

  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: parentId ? 'Reply added to comment' : 'Comment added'
  });

  const fullCommentResult = await pool.query(
    `
      SELECT c.comment_id, c.task_id, c.parent_comment_id, c.comment_text, c.created_at,
             u.user_id, u.full_name, u.email, r.role_name AS user_role,
             parent_user.full_name AS parent_user_name
      FROM TaskComments c
      INNER JOIN Users u ON u.user_id = c.user_id
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN TaskComments parent_c ON parent_c.comment_id = c.parent_comment_id
      LEFT JOIN Users parent_user ON parent_user.user_id = parent_c.user_id
      WHERE c.comment_id = $1
    `,
    [newComment.comment_id]
  );

  const commentPayload = fullCommentResult.rows[0] || newComment;

  if (parentId) {
    const parentCommentResult = await pool.query(
      'SELECT user_id FROM TaskComments WHERE comment_id = $1',
      [parentId]
    );
    const parentUserId = parentCommentResult.rows[0]?.user_id;
    if (parentUserId && Number(parentUserId) !== Number(req.user.user_id)) {
      await notifyUserSafely({
        userId: parentUserId,
        relatedTaskId: task.task_id,
        type: 'comment_reply',
        title: 'New reply to your comment',
        message: `${req.user.full_name} replied to your comment on ${formatTaskSummary(task)}.`
      });
    }
  }

  await notifyAssignedUser(task, req.user.user_id, {
    type: 'comment_added',
    title: parentId ? 'New comment reply' : 'New task comment',
    message: `${req.user.full_name} ${parentId ? 'replied on' : 'commented on'} ${formatTaskSummary(task)}.`
  });

  emitTaskMutation(task, 'comment_added', req.user.user_id);

  return res.status(201).json({ comment: commentPayload });
});

export const updateTaskComment = asyncHandler(async (req, res) => {
  const { comment_text } = req.body;
  const { id: taskId, comment_id: commentId } = req.params;

  if (!comment_text || !comment_text.trim()) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, taskId);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const existingResult = await pool.query(
    'SELECT * FROM TaskComments WHERE comment_id = $1 AND task_id = $2',
    [commentId, taskId]
  );
  const existingComment = existingResult.rows[0];
  if (!existingComment) return res.status(404).json({ message: 'Comment not found.' });

  const isAuthorized = req.user.role_name === 'admin' || Number(existingComment.user_id) === Number(req.user.user_id);
  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized to edit this comment.' });
  }

  await pool.query(
    'UPDATE TaskComments SET comment_text = $1 WHERE comment_id = $2',
    [comment_text.trim(), commentId]
  );

  const fullCommentResult = await pool.query(
    `
      SELECT c.comment_id, c.task_id, c.parent_comment_id, c.comment_text, c.created_at,
             u.user_id, u.full_name, u.email, r.role_name AS user_role,
             parent_user.full_name AS parent_user_name
      FROM TaskComments c
      INNER JOIN Users u ON u.user_id = c.user_id
      INNER JOIN Roles r ON r.role_id = u.role_id
      LEFT JOIN TaskComments parent_c ON parent_c.comment_id = c.parent_comment_id
      LEFT JOIN Users parent_user ON parent_user.user_id = parent_c.user_id
      WHERE c.comment_id = $1
    `,
    [commentId]
  );

  emitTaskMutation(task, 'comment_updated', req.user.user_id);

  return res.json({ comment: fullCommentResult.rows[0] });
});

export const deleteTaskComment = asyncHandler(async (req, res) => {
  const { id: taskId, comment_id: commentId } = req.params;

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, taskId);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const existingResult = await pool.query(
    'SELECT * FROM TaskComments WHERE comment_id = $1 AND task_id = $2',
    [commentId, taskId]
  );
  const existingComment = existingResult.rows[0];
  if (!existingComment) return res.status(404).json({ message: 'Comment not found.' });

  const isAuthorized = req.user.role_name === 'admin' || Number(existingComment.user_id) === Number(req.user.user_id);
  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized to delete this comment.' });
  }

  await pool.query('DELETE FROM TaskComments WHERE comment_id = $1', [commentId]);

  emitTaskMutation(task, 'comment_deleted', req.user.user_id);

  return res.json({ message: 'Comment deleted successfully.' });
});

export const getTaskRemarks = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  await ensureTaskRemarksTable(pool);
  const remarks = await fetchTaskRemarks(pool, req.params.id);
  return res.json({ remarks });
});

export const addTaskRemark = asyncHandler(async (req, res) => {
  const { remark_date, remark_text } = req.body;
  if (!remark_text?.trim()) return res.status(400).json({ message: 'Remark text is required.' });

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  await ensureTaskRemarksTable(pool);
  const remarkDate = nullableDate(remark_date) || new Date();
  const result = await pool.query(
    `
      INSERT INTO TaskRemarks (task_id, user_id, remark_date, remark_text)
      VALUES ($1, $2, $3, $4)
      RETURNING remark_id
    `,
    [req.params.id, req.user.user_id, remarkDate, remark_text.trim()]
  );

  const remarkId = result.rows[0].remark_id;
  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: `Daily remark added for ${toSqlDateString(remarkDate)}`
  });

  const remark = await fetchTaskRemarkById(pool, remarkId);
  await notifyAssignedUser(task, req.user.user_id, {
    type: 'remark_added',
    title: 'New task remark',
    message: `${req.user.full_name} added a remark on ${formatTaskSummary(task)}.`
  });
  emitTaskMutation(task, 'remark_added', req.user.user_id);

  return res.status(201).json({ remark });
});

export const updateTaskRemark = asyncHandler(async (req, res) => {
  const { remark_date, remark_text } = req.body;
  if (!remark_text?.trim()) return res.status(400).json({ message: 'Remark text is required.' });

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const remarkId = req.params.remark_id;
  const existingRemark = await fetchTaskRemarkById(pool, remarkId);
  if (!existingRemark || existingRemark.task_id != req.params.id) {
    return res.status(404).json({ message: 'Remark not found.' });
  }

  const remarkDate = nullableDate(remark_date) || new Date();
  
  await pool.query(
    `
      UPDATE TaskRemarks 
      SET remark_date = $1, remark_text = $2, updated_at = CURRENT_TIMESTAMP
      WHERE remark_id = $3
    `,
    [remarkDate, remark_text.trim(), remarkId]
  );

  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: `Daily remark updated for ${toSqlDateString(remarkDate)}`
  });

  const remark = await fetchTaskRemarkById(pool, remarkId);
  emitTaskMutation(task, 'remark_updated', req.user.user_id);
  return res.json({ remark });
});

export const deleteTaskRemark = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const remarkId = req.params.remark_id;
  const existingRemark = await fetchTaskRemarkById(pool, remarkId);
  if (!existingRemark || existingRemark.task_id != req.params.id) {
    return res.status(404).json({ message: 'Remark not found.' });
  }

  await pool.query('DELETE FROM TaskRemarks WHERE remark_id = $1', [remarkId]);

  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: `Daily remark deleted for ${toSqlDateString(existingRemark.remark_date)}`
  });
  emitTaskMutation(task, 'remark_deleted', req.user.user_id);

  return res.json({ message: 'Remark deleted successfully.' });
});

export const getTaskAttachments = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const result = await pool.query(
    `
      SELECT a.attachment_id, a.task_id, a.user_id, a.file_name, a.original_name,
             a.file_size, a.mime_type, a.file_path, a.created_at, u.full_name AS uploaded_by_name
      FROM TaskAttachments a
      LEFT JOIN Users u ON u.user_id = a.user_id
      WHERE a.task_id = $1
      ORDER BY a.created_at DESC
    `,
    [req.params.id]
  );

  return res.json({ attachments: result.rows });
});

export const uploadTaskAttachment = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const { filename, originalname, size, mimetype, path: filePath } = req.file;

  const result = await pool.query(
    `
      INSERT INTO TaskAttachments (task_id, user_id, file_name, original_name, file_size, mime_type, file_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id, task_id, user_id, file_name, original_name, file_size, mime_type, file_path, created_at
    `,
    [req.params.id, req.user.user_id, filename, originalname, size, mimetype, filePath]
  );

  const attachment = result.rows[0];

  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: `Attachment added: ${originalname}`
  });

  emitTaskMutation(task, 'attachment_added', req.user.user_id);

  return res.status(201).json({ attachment: { ...attachment, uploaded_by_name: req.user.full_name } });
});

export const addLinkAttachment = asyncHandler(async (req, res) => {
  const { url, title } = req.body;
  if (!url || !url.trim()) {
    return res.status(400).json({ message: 'URL link is required.' });
  }

  const pool = await getPool();
  const task = await findAuthorizedTask(pool, req, req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found.' });

  const rawUrl = url.trim();
  const formattedUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;

  const linkTitle = title?.trim() || formattedUrl;

  const result = await pool.query(
    `
      INSERT INTO TaskAttachments (task_id, user_id, file_name, original_name, file_size, mime_type, file_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING attachment_id, task_id, user_id, file_name, original_name, file_size, mime_type, file_path, created_at
    `,
    [req.params.id, req.user.user_id, 'link', linkTitle, 0, 'url', formattedUrl]
  );

  const attachment = result.rows[0];

  await recordHistory(pool, {
    taskId: req.params.id,
    changedBy: req.user.user_id,
    oldStatus: task.status,
    newStatus: task.status,
    oldPriority: task.priority,
    newPriority: task.priority,
    description: `Link added: ${linkTitle}`
  });

  emitTaskMutation(task, 'attachment_added', req.user.user_id);

  return res.status(201).json({ attachment: { ...attachment, uploaded_by_name: req.user.full_name } });
});

export const downloadTaskAttachment = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT a.*, t.assigned_user_id FROM TaskAttachments a INNER JOIN Tasks t ON t.task_id = a.task_id WHERE a.attachment_id = $1',
    [req.params.attachmentId]
  );

  const attachment = result.rows[0];
  if (!attachment) return res.status(404).json({ message: 'Attachment not found.' });

  const isAuthorized = ['admin', 'presenter'].includes(req.user.role_name) || attachment.assigned_user_id === req.user.user_id;
  if (!isAuthorized) return res.status(403).json({ message: 'Not authorized to download this file.' });

  const fullPath = path.isAbsolute(attachment.file_path)
    ? attachment.file_path
    : path.join(process.cwd(), attachment.file_path);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ message: 'File not found on server disk.' });
  }

  return res.download(fullPath, attachment.original_name);
});

export const deleteTaskAttachment = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.query(
    'SELECT a.*, t.assigned_user_id, t.status, t.priority FROM TaskAttachments a INNER JOIN Tasks t ON t.task_id = a.task_id WHERE a.attachment_id = $1',
    [req.params.attachmentId]
  );

  const attachment = result.rows[0];
  if (!attachment) return res.status(404).json({ message: 'Attachment not found.' });

  const isAuthorized = ['admin'].includes(req.user.role_name) || attachment.user_id === req.user.user_id;
  if (!isAuthorized) return res.status(403).json({ message: 'Not authorized to delete this file.' });

  await pool.query('DELETE FROM TaskAttachments WHERE attachment_id = $1', [req.params.attachmentId]);

  if (attachment.mime_type !== 'url') {
    const fullPath = path.isAbsolute(attachment.file_path)
      ? attachment.file_path
      : path.join(process.cwd(), attachment.file_path);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  const task = await findTaskById(pool, attachment.task_id);
  if (task) {
    await recordHistory(pool, {
      taskId: attachment.task_id,
      changedBy: req.user.user_id,
      oldStatus: task.status,
      newStatus: task.status,
      oldPriority: task.priority,
      newPriority: task.priority,
      description: `Attachment deleted: ${attachment.original_name}`
    });
    emitTaskMutation(task, 'attachment_deleted', req.user.user_id);
  }

  return res.json({ message: 'Attachment deleted successfully.' });
});

const buildTaskWhere = (req, params) => {
  const where = [];
  const q = req.query;
  const isAdmin = req.user.role_name === 'admin';
  const canViewAll = isAdmin || req.user.role_name === 'presenter';

  if (!canViewAll) {
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
  if (q.parent_project_id) {
    params.push(q.parent_project_id);
    where.push(`(p.parent_project_id = $${params.length} OR (p.project_id = $${params.length} AND p.parent_project_id IS NULL))`);
  }
  if (q.story_points) {
    params.push(q.story_points);
    where.push(`t.story_points = $${params.length}`);
  }
  if (q.module) {
    params.push(q.module);
    where.push(`t.module_name = $${params.length}`);
  }
  if (q.onsite_offshore) {
    params.push(q.onsite_offshore);
    where.push(`t.onsite_offshore = $${params.length}`);
  }
  if (q.date) {
    params.push(nullableDate(q.date));
    where.push(`t.due_date = $${params.length}`);
  } else if (q.date_from) {
    params.push(nullableDate(q.date_from));
    where.push(`t.due_date >= $${params.length}`);
  }
  if (!q.date && q.date_to) {
    params.push(nullableDate(q.date_to));
    where.push(`t.due_date <= $${params.length}`);
  }
  if (q.search) {
    params.push(`%${q.search}%`);
    const pIdx = params.length;
    where.push(`(t.task_title ILIKE $${pIdx} OR t.description ILIKE $${pIdx} OR t.remarks ILIKE $${pIdx} OR t.employee_name ILIKE $${pIdx} OR p.project_name ILIKE $${pIdx})`);
  }

  return where;
};

const findAuthorizedTask = async (pool, req, taskId) => {
  const task = await findTaskById(pool, taskId);
  if (!task) return null;
  if (!['admin', 'presenter'].includes(req.user.role_name) && task.assigned_user_id !== req.user.user_id) {
    return null;
  }
  return task;
};

const findTaskById = async (pool, taskId) => {
  const result = await pool.query(`${taskSelect} WHERE t.task_id = $1`, [taskId]);
  return result.rows[0] || null;
};

const recordHistory = async (pool, history) => {
  await pool.query(
    `
      INSERT INTO TaskHistory (
        task_id, changed_by, old_status, new_status, old_priority, new_priority, change_description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      history.taskId,
      history.changedBy,
      history.oldStatus || null,
      history.newStatus || null,
      history.oldPriority || null,
      history.newPriority || null,
      history.description || null
    ]
  );
};

const ensureTaskRemarksTable = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS TaskRemarks (
      remark_id SERIAL PRIMARY KEY,
      task_id INT NOT NULL REFERENCES Tasks(task_id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES Users(user_id),
      remark_date DATE NOT NULL,
      remark_text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS IX_TaskRemarks_task_date ON TaskRemarks(task_id, remark_date DESC, created_at DESC);
  `);
};

const fetchTaskRemarks = async (pool, taskId) => {
  const result = await pool.query(
    `
      SELECT r.remark_id, r.task_id, r.user_id, r.remark_date, r.remark_text, r.created_at, r.updated_at,
             u.full_name, u.email
      FROM TaskRemarks r
      INNER JOIN Users u ON u.user_id = r.user_id
      WHERE r.task_id = $1
      ORDER BY r.remark_date DESC, r.created_at DESC
    `,
    [taskId]
  );
  return result.rows;
};

const fetchTaskRemarkById = async (pool, remarkId) => {
  const result = await pool.query(
    `
      SELECT r.remark_id, r.task_id, r.user_id, r.remark_date, r.remark_text, r.created_at, r.updated_at,
             u.full_name, u.email
      FROM TaskRemarks r
      INNER JOIN Users u ON u.user_id = r.user_id
      WHERE r.remark_id = $1
    `,
    [remarkId]
  );
  return result.rows[0] || null;
};

const notifyAssignedUser = async (task, actorUserId, notification) => {
  if (!task?.assigned_user_id || Number(task.assigned_user_id) === Number(actorUserId)) return;

  await notifyUserSafely({
    userId: task.assigned_user_id,
    relatedTaskId: task.task_id,
    ...notification
  });
};

const notifyUserSafely = async (payload) => {
  try {
    await createNotification(payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Failed to create notification:', error);
    }
  }
};

const emitTaskMutation = (task, action, actorUserId, extraUserIds = []) => {
  emitTaskChange({
    task,
    action,
    userIds: [actorUserId, ...extraUserIds]
  });
};

const formatTaskSummary = (task) => {
  if (!task) return 'a task';
  const meta = [task.project_name, task.module_name].filter(Boolean).join(' / ');
  return meta ? `${task.task_title} (${meta})` : task.task_title;
};

const resolveEmployeeName = async (pool, userId, fallbackName, defaultName) => {
  if (!userId) return fallbackName || defaultName || null;
  const result = await pool.query('SELECT full_name FROM Users WHERE user_id = $1', [userId]);
  return result.rows[0]?.full_name || fallbackName || defaultName || null;
};

const nullableInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return Number(value);
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePageSize = (value) => Math.min(parsePositiveInt(value, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

const valueOrExistingInt = (value, existing) => {
  if (value === undefined) return existing;
  return nullableInt(value);
};

const nullableDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const valueOrExistingDate = (value, existing) => {
  if (value === undefined) return existing;
  return nullableDate(value);
};

const toSqlDateString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};
