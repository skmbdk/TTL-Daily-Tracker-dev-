// import dotenv from 'dotenv';
// import { getPool } from '../config/db.js';

// dotenv.config();

// const migrate = async () => {
//   try {
//     const pool = await getPool();
    
//     console.log('Starting migration of old remarks...');

//     // 1. Purane remarks ko uthakar naye 'TaskRemarks' table mein Date-wise insert karna
//     const insertResult = await pool.request().query(`
//       INSERT INTO TaskRemarks (task_id, user_id, remark_date, remark_text, created_at, updated_at)
//       SELECT 
//         t.task_id,
//         COALESCE(t.assigned_user_id, t.created_by) AS user_id,
//         CAST(COALESCE(t.updated_at, t.created_at) AS DATE) AS remark_date,
//         CAST(t.remarks AS NVARCHAR(MAX)) AS remark_text,
//         COALESCE(t.updated_at, t.created_at) AS created_at,
//         SYSUTCDATETIME() AS updated_at
//       FROM Tasks t
//       WHERE t.remarks IS NOT NULL 
//         AND LEN(CAST(t.remarks AS NVARCHAR(MAX))) > 0
//         AND NOT EXISTS (
//           SELECT 1 FROM TaskRemarks tr 
//           WHERE tr.task_id = t.task_id 
//             AND CAST(tr.remark_text AS NVARCHAR(MAX)) = CAST(t.remarks AS NVARCHAR(MAX))
//         );
//     `);

//     // 2. Taki Excel mein data double na aaye, purane column ko saaf kar dena
//     await pool.request().query(`UPDATE Tasks SET remarks = NULL WHERE remarks IS NOT NULL;`);

//     console.log(`Success! Migrated ${insertResult.rowsAffected[0] || 0} old remarks to the new date-wise UI format.`);
//     process.exit(0);
//   } catch (error) {
//     console.error('Migration failed:', error.message);
//     process.exit(1);
//   }
// };

// migrate();

import dotenv from 'dotenv';
import { getPool } from '../config/db.js';

dotenv.config();

const migrate = async () => {
  try {
    const pool = await getPool();
    
    console.log('Starting migration of old remarks...');

    const insertResult = await pool.query(`
      INSERT INTO TaskRemarks (task_id, user_id, remark_date, remark_text, created_at, updated_at)
      SELECT 
        t.task_id,
        COALESCE(t.assigned_user_id, t.created_by) AS user_id,
        COALESCE(t.updated_at, t.created_at)::date AS remark_date,
        t.remarks AS remark_text,
        COALESCE(t.updated_at, t.created_at) AS created_at,
        CURRENT_TIMESTAMP AS updated_at
      FROM Tasks t
      WHERE t.remarks IS NOT NULL 
        AND LENGTH(t.remarks) > 0
        AND NOT EXISTS (
          SELECT 1 FROM TaskRemarks tr 
          WHERE tr.task_id = t.task_id 
            AND tr.remark_text = t.remarks
        );
    `);

    await pool.query(`UPDATE Tasks SET remarks = NULL WHERE remarks IS NOT NULL;`);

    console.log(`Success! Migrated ${insertResult.rowCount || 0} old remarks to the new date-wise UI format.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();