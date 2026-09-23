import dotenv from 'dotenv';
import sql from 'mssql';

dotenv.config();

const tableOrder = [
  { name: 'Roles', identity: 'role_id' },
  { name: 'Users', identity: 'user_id' },
  { name: 'Projects', identity: 'project_id' },
  { name: 'ProjectMembers', identity: 'project_member_id' },
  { name: 'Tasks', identity: 'task_id' },
  { name: 'TaskComments', identity: 'comment_id' },
  { name: 'TaskHistory', identity: 'history_id' },
  { name: 'ExcelImports', identity: 'import_id' }
];

const toBool = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
};

const buildConfig = (prefix, defaults = {}) => ({
  user: process.env[`${prefix}_USER`] || defaults.user,
  password: process.env[`${prefix}_PASSWORD`] || defaults.password,
  server: process.env[`${prefix}_SERVER`] || defaults.server,
  database: process.env[`${prefix}_DATABASE`] || defaults.database,
  port: Number(process.env[`${prefix}_PORT`] || defaults.port || 1433),
  connectionTimeout: Number(process.env[`${prefix}_CONNECTION_TIMEOUT`] || 60000),
  requestTimeout: Number(process.env[`${prefix}_REQUEST_TIMEOUT`] || 60000),
  options: {
    encrypt: toBool(process.env[`${prefix}_ENCRYPT`], defaults.encrypt),
    trustServerCertificate: toBool(
      process.env[`${prefix}_TRUST_SERVER_CERTIFICATE`],
      defaults.trustServerCertificate
    )
  },
  pool: {
    max: 5,
    min: 0,
    idleTimeoutMillis: 30000
  }
});

const sourceConfig = buildConfig('LOCAL_DB', {
  user: 'sa',
  password: 'YourStrong!Passw0rd',
  server: 'localhost',
  database: 'ZiraAgile',
  port: 1433,
  encrypt: false,
  trustServerCertificate: true
});

const targetConfig = buildConfig('DB');

const ensureTargetConfig = () => {
  const missing = ['user', 'password', 'server', 'database'].filter((key) => !targetConfig[key]);
  if (missing.length) {
    throw new Error(`Azure target config missing: ${missing.join(', ')}`);
  }
};

const quote = (name) => `[${name}]`;
const fullTableName = (name) => `[dbo].[${name}]`;

const getTableCount = async (pool, tableName) => {
  const result = await pool.request().query(`SELECT COUNT(*) AS count FROM ${fullTableName(tableName)}`);
  return result.recordset[0].count;
};

const inferSqlType = (value) => {
  if (value === null || value === undefined) {
    return sql.NVarChar(sql.MAX);
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? sql.Int : sql.Float;
  }

  if (typeof value === 'boolean') {
    return sql.Bit;
  }

  if (value instanceof Date) {
    return sql.DateTime2;
  }

  if (Buffer.isBuffer(value)) {
    return sql.VarBinary(sql.MAX);
  }

  return sql.NVarChar(sql.MAX);
};

const toSqlLiteral = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (Buffer.isBuffer(value)) return `0x${value.toString('hex')}`;

  const escaped = String(value).replace(/'/g, "''");
  return `N'${escaped}'`;
};

const chunkRows = (rows, size = 100) => {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
};

const insertRows = async (pool, table, rows) => {
  if (!rows.length) return 0;

  const columns = Object.keys(rows[0]);
  const columnList = columns.map(quote).join(', ');
  const statements = [];

  if (table.identity) {
    statements.push(`SET IDENTITY_INSERT ${fullTableName(table.name)} ON;`);
  }

  for (const chunk of chunkRows(rows)) {
    const values = chunk
      .map((row) => `(${columns.map((column) => toSqlLiteral(row[column])).join(', ')})`)
      .join(',\n');
    statements.push(`INSERT INTO ${fullTableName(table.name)} (${columnList}) VALUES\n${values};`);
  }

  if (table.identity) {
    statements.push(`SET IDENTITY_INSERT ${fullTableName(table.name)} OFF;`);
  }

  await pool.request().batch(statements.join('\n'));

  return rows.length;
};

const main = async () => {
  ensureTargetConfig();

  const sourcePool = await sql.connect(sourceConfig);
  const targetPool = new sql.ConnectionPool(targetConfig);
  await targetPool.connect();

  try {
    const targetCounts = {};
    for (const table of tableOrder) {
      targetCounts[table.name] = await getTableCount(targetPool, table.name);
    }

    const hasTargetData = Object.values(targetCounts).some((count) => count > 0);
    if (hasTargetData && process.env.MIGRATE_FORCE !== 'true') {
      throw new Error(
        `Target Azure DB already has data: ${JSON.stringify(targetCounts)}. Set MIGRATE_FORCE=true to bypass.`
      );
    }

    const sourceCounts = {};
    for (const table of tableOrder) {
      sourceCounts[table.name] = await getTableCount(sourcePool, table.name);
    }

    console.log('Source counts:', sourceCounts);
    console.log('Target counts before migration:', targetCounts);

    for (const table of tableOrder) {
      const result = await sourcePool
        .request()
        .query(`SELECT * FROM ${fullTableName(table.name)} ORDER BY ${quote(table.identity)}`);
      const inserted = await insertRows(targetPool, table, result.recordset);
      console.log(`Migrated ${inserted} rows into ${table.name}`);
    }

    const finalCounts = {};
    for (const table of tableOrder) {
      finalCounts[table.name] = await getTableCount(targetPool, table.name);
    }

    console.log('Target counts after migration:', finalCounts);
  } finally {
    await sourcePool.close();
    await targetPool.close();
  }
};

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
