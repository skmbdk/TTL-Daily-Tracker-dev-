// import sql from 'mssql';
// import dotenv from 'dotenv';

// dotenv.config();

// const toBool = (value, fallback = false) => {
//   if (value === undefined) return fallback;
//   return String(value).toLowerCase() === 'true';
// };

// const dbConfig = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   server: process.env.DB_SERVER || 'localhost',
//   database: process.env.DB_DATABASE,
//   port: Number(process.env.DB_PORT || 1433),
//   connectionTimeout: Number(process.env.DB_CONNECTION_TIMEOUT || 60000),
//   requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT || 60000),
//   options: {
//     encrypt: toBool(process.env.DB_ENCRYPT, false),
//     trustServerCertificate: toBool(process.env.DB_TRUST_SERVER_CERTIFICATE, true)
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// };

// let pool;
// let poolPromise;

// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const isTransientConnectionError = (error) => {
//   const code = error?.code || error?.originalError?.code;
//   const message = error?.message || error?.originalError?.message || '';
//   return ['ETIMEOUT', 'ESOCKET'].includes(code) || message.includes('EAI_AGAIN');
// };

// export const getPool = async () => {
//   if (pool?.connected && !pool?.closed) return pool;
//   if (poolPromise) return poolPromise;

//   poolPromise = connectWithRetry().finally(() => {
//     poolPromise = undefined;
//   });

//   return poolPromise;
// };

// const connectWithRetry = async () => {
//   let lastError;
//   for (let attempt = 0; attempt < 3; attempt += 1) {
//     let candidatePool;
//     try {
//       candidatePool = new sql.ConnectionPool(dbConfig);
//       candidatePool.on('error', () => {
//         if (pool === candidatePool) {
//           pool = undefined;
//         }
//       });
//       pool = await candidatePool.connect();
//       return pool;
//     } catch (error) {
//       lastError = error;
//       await candidatePool?.close().catch(() => {});
//       pool = undefined;
//       if (!isTransientConnectionError(error) || attempt === 2) {
//         throw error;
//       }
//       await wait((attempt + 1) * 1500);
//     }
//   }

//   throw lastError;
// };

// export { sql };


import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'jira_agile',
  port: Number(process.env.DB_PORT || 5432),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const getPool = async () => {
  return pool;
};

export const query = (text, params) => pool.query(text, params);

export default pool;
