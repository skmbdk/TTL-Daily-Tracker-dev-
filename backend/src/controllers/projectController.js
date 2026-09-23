// import { getPool, sql } from '../config/db.js';
// import { asyncHandler } from '../utils/asyncHandler.js';

// export const getProjects = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const request = pool.request();
//   const where = [];

//   if (!['admin', 'presenter'].includes(req.user.role_name)) {
//     request.input('user_id', sql.Int, req.user.user_id);
//     where.push('(pm.user_id = @user_id OR t.assigned_user_id = @user_id OR p.status = \'Active\')');
//   }

//   const result = await request.query(`
//     SELECT p.project_id, p.project_name, p.description, p.start_date, p.end_date, p.status,
//            p.created_by, p.created_at, p.updated_at, creator.full_name AS created_by_name,
//            COUNT(DISTINCT t.task_id) AS task_count,
//            SUM(CASE WHEN t.status = 'Done' THEN 1 ELSE 0 END) AS completed_count,
//            STUFF((SELECT ',' + CAST(pm2.user_id AS VARCHAR(10)) FROM ProjectMembers pm2 WHERE pm2.project_id = p.project_id FOR XML PATH('')), 1, 1, '') AS member_ids,
//            STUFF((SELECT ',' + CAST(t2.assigned_user_id AS VARCHAR(10)) FROM (SELECT DISTINCT assigned_user_id FROM Tasks WHERE project_id = p.project_id AND assigned_user_id IS NOT NULL) t2 FOR XML PATH('')), 1, 1, '') AS working_member_ids
//     FROM Projects p
//     LEFT JOIN Users creator ON creator.user_id = p.created_by
//     LEFT JOIN ProjectMembers pm ON pm.project_id = p.project_id
//     LEFT JOIN Tasks t ON t.project_id = p.project_id
//     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
//     GROUP BY p.project_id, p.project_name, p.description, p.start_date, p.end_date, p.status,
//              p.created_by, p.created_at, p.updated_at, creator.full_name
//     ORDER BY p.created_at DESC
//   `);

//   return res.json({ projects: result.recordset });
// });

// export const createProject = asyncHandler(async (req, res) => {
//   const { project_name, description, start_date, end_date, status = 'Active', member_ids = [] } = req.body;
//   if (!project_name) return res.status(400).json({ message: 'Project name is required.' });

//   const pool = await getPool();
//   const transaction = new sql.Transaction(pool);
//   await transaction.begin();

//   try {
//     const projectResult = await new sql.Request(transaction)
//       .input('project_name', sql.NVarChar(160), project_name)
//       .input('description', sql.NVarChar(sql.MAX), description || null)
//       .input('start_date', sql.Date, nullableDate(start_date))
//       .input('end_date', sql.Date, nullableDate(end_date))
//       .input('status', sql.NVarChar(30), status)
//       .input('created_by', sql.Int, req.user.user_id)
//       .query(`
//         INSERT INTO Projects (project_name, description, start_date, end_date, status, created_by)
//         OUTPUT INSERTED.*
//         VALUES (@project_name, @description, @start_date, @end_date, @status, @created_by)
//       `);

//     const project = projectResult.recordset[0];

//     for (const memberId of member_ids) {
//       await new sql.Request(transaction)
//         .input('project_id', sql.Int, project.project_id)
//         .input('user_id', sql.Int, memberId)
//         .input('role_in_project', sql.NVarChar(80), 'Member')
//         .query(`
//           IF NOT EXISTS (
//             SELECT 1 FROM ProjectMembers WHERE project_id = @project_id AND user_id = @user_id
//           )
//           INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
//           VALUES (@project_id, @user_id, @role_in_project)
//         `);
//     }

//     await transaction.commit();
//     return res.status(201).json({ project });
//   } catch (error) {
//     await transaction.rollback();
//     throw error;
//   }
// });

// export const updateProject = asyncHandler(async (req, res) => {
//   const { project_name, description, start_date, end_date, status, member_ids } = req.body;
//   const pool = await getPool();
//   const transaction = new sql.Transaction(pool);
//   await transaction.begin();

//   try {
//     const result = await new sql.Request(transaction)
//       .input('project_id', sql.Int, req.params.id)
//       .input('project_name', sql.NVarChar(160), project_name || null)
//       .input('description', sql.NVarChar(sql.MAX), description || null)
//       .input('start_date', sql.Date, start_date === undefined ? null : nullableDate(start_date))
//       .input('end_date', sql.Date, end_date === undefined ? null : nullableDate(end_date))
//       .input('status', sql.NVarChar(30), status || null)
//       .query(`
//         UPDATE Projects
//         SET project_name = COALESCE(@project_name, project_name),
//             description = COALESCE(@description, description),
//             start_date = CASE WHEN @start_date IS NULL THEN start_date ELSE @start_date END,
//             end_date = CASE WHEN @end_date IS NULL THEN end_date ELSE @end_date END,
//             status = COALESCE(@status, status),
//             updated_at = SYSUTCDATETIME()
//         OUTPUT INSERTED.*
//         WHERE project_id = @project_id
//       `);

//     if (!result.recordset.length) {
//       await transaction.rollback();
//       return res.status(404).json({ message: 'Project not found.' });
//     }

//     if (Array.isArray(member_ids)) {
//       await new sql.Request(transaction)
//         .input('project_id', sql.Int, req.params.id)
//         .query('DELETE FROM ProjectMembers WHERE project_id = @project_id');

//       for (const memberId of member_ids) {
//         await new sql.Request(transaction)
//           .input('project_id', sql.Int, req.params.id)
//           .input('user_id', sql.Int, memberId)
//           .input('role_in_project', sql.NVarChar(80), 'Member')
//           .query(`
//             INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
//             VALUES (@project_id, @user_id, @role_in_project)
//           `);
//       }
//     }

//     await transaction.commit();
//     return res.json({ project: result.recordset[0] });
//   } catch (error) {
//     await transaction.rollback();
//     throw error;
//   }
// });

// export const deleteProject = asyncHandler(async (req, res) => {
//   const pool = await getPool();
//   const result = await pool
//     .request()
//     .input('project_id', sql.Int, req.params.id)
//     .query(`
//       UPDATE Projects
//       SET status = 'Archived', updated_at = SYSUTCDATETIME()
//       WHERE project_id = @project_id
//     `);

//   if (!result.rowsAffected[0]) return res.status(404).json({ message: 'Project not found.' });
//   return res.json({ message: 'Project archived successfully.' });
// });

// const nullableDate = (value) => {
//   if (!value) return null;
//   const date = value instanceof Date ? value : new Date(value);
//   return Number.isNaN(date.getTime()) ? null : date;
// };

import { getPool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProjects = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const params = [];
  const where = [];

  if (!['admin', 'presenter'].includes(req.user.role_name)) {
    params.push(req.user.user_id);
    where.push(`(pm.user_id = $${params.length} OR t.assigned_user_id = $${params.length} OR p.status = 'Active')`);
  }

  const result = await pool.query(
    `
      SELECT p.project_id, p.project_name, p.description, p.parent_project_id, p.start_date, p.end_date, p.status,
             p.created_by, p.created_at, p.updated_at, creator.full_name AS created_by_name,
             parent.project_name AS parent_project_name,
             COUNT(DISTINCT t.task_id)::int AS task_count,
             SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END)::int AS completed_count,
             (SELECT STRING_AGG(pm2.user_id::text, ',') FROM ProjectMembers pm2 WHERE pm2.project_id = p.project_id) AS member_ids,
             (SELECT STRING_AGG(t2.assigned_user_id::text, ',') FROM (SELECT DISTINCT assigned_user_id FROM Tasks WHERE project_id = p.project_id AND assigned_user_id IS NOT NULL) t2) AS working_member_ids
      FROM Projects p
      LEFT JOIN Users creator ON creator.user_id = p.created_by
      LEFT JOIN Projects parent ON parent.project_id = p.parent_project_id
      LEFT JOIN ProjectMembers pm ON pm.project_id = p.project_id
      LEFT JOIN Tasks t ON t.project_id = p.project_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      GROUP BY p.project_id, p.project_name, p.description, p.parent_project_id, p.start_date, p.end_date, p.status,
               p.created_by, p.created_at, p.updated_at, creator.full_name, parent.project_name
      ORDER BY p.created_at DESC
    `,
    params
  );

  return res.json({ projects: result.rows });
});

export const createProject = asyncHandler(async (req, res) => {
  const { project_name, description, parent_project_id, start_date, end_date, status = 'Active', member_ids = [] } = req.body;
  if (!project_name) return res.status(400).json({ message: 'Project name is required.' });

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const parsedParentId = parent_project_id ? Number(parent_project_id) : null;

    const projectResult = await client.query(
      `
        INSERT INTO Projects (project_name, description, parent_project_id, start_date, end_date, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [project_name, description || null, parsedParentId, nullableDate(start_date), nullableDate(end_date), status, req.user.user_id]
    );

    const project = projectResult.rows[0];

    for (const memberId of member_ids) {
      await client.query(
        `
          INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
          VALUES ($1, $2, $3)
          ON CONFLICT (project_id, user_id) DO NOTHING
        `,
        [project.project_id, memberId, 'Member']
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ project });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const updateProject = asyncHandler(async (req, res) => {
  const { project_name, description, parent_project_id, start_date, end_date, status, member_ids } = req.body;
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const parsedParentId = parent_project_id === null || parent_project_id === '' ? null : Number(parent_project_id);

    const result = await client.query(
      `
        UPDATE Projects
        SET project_name = COALESCE($1, project_name),
            description = COALESCE($2, description),
            parent_project_id = $3,
            start_date = CASE WHEN $4::date IS NULL THEN start_date ELSE $4::date END,
            end_date = CASE WHEN $5::date IS NULL THEN end_date ELSE $5::date END,
            status = COALESCE($6, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $7
        RETURNING *
      `,
      [
        project_name || null,
        description || null,
        parsedParentId,
        start_date === undefined ? null : nullableDate(start_date),
        end_date === undefined ? null : nullableDate(end_date),
        status || null,
        req.params.id
      ]
    );

    if (!result.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (Array.isArray(member_ids)) {
      await client.query('DELETE FROM ProjectMembers WHERE project_id = $1', [req.params.id]);

      for (const memberId of member_ids) {
        await client.query(
          `
            INSERT INTO ProjectMembers (project_id, user_id, role_in_project)
            VALUES ($1, $2, $3)
            ON CONFLICT (project_id, user_id) DO NOTHING
          `,
          [req.params.id, memberId, 'Member']
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ project: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

export const deleteProject = asyncHandler(async (req, res) => {
  const pool = await getPool();
  const result = await pool.query(
    `
      UPDATE Projects
      SET status = 'Archived', updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $1
    `,
    [req.params.id]
  );

  if (!result.rowCount) return res.status(404).json({ message: 'Project not found.' });
  return res.json({ message: 'Project archived successfully.' });
});

const nullableDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

