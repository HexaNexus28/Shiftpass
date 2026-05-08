#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = process.env.NODE_ENV === 'local'
  ? resolve(__dirname, '../.env.local')
  : resolve(__dirname, '../.env.local');

dotenv.config({ path: envFile });
console.log(`ℹ️  Loaded env from: ${envFile}`);

const { SUPABASE_DB_URL, SUPABASE_DB_PASSWORD } = process.env;

if (!SUPABASE_DB_URL) {
  console.error('❌ SUPABASE_DB_URL is not set in env file');
  process.exit(1);
}

// Parse the DB URL to extract connection params — avoids @ in password breaking URL parsing
function buildPgConfig(rawUrl, password) {
  // Strip the password from the URL to get a clean parseable URL
  // Format: postgresql://user:pass@host:port/db  OR  postgresql://user@host:port/db
  const withoutScheme = rawUrl.replace(/^postgresql:\/\//, '');
  const atLastIndex = withoutScheme.lastIndexOf('@');
  const userInfo = withoutScheme.slice(0, atLastIndex);
  const hostInfo = withoutScheme.slice(atLastIndex + 1);

  const user = userInfo.includes(':') ? userInfo.split(':')[0] : userInfo;
  const [hostPort, database] = hostInfo.split('/');
  const [host, port] = hostPort.includes(':') ? hostPort.split(':') : [hostPort, '5432'];

  return {
    host,
    port: parseInt(port ?? '5432', 10),
    database: database ?? 'postgres',
    user,
    password: password ?? (userInfo.includes(':') ? userInfo.slice(user.length + 1) : ''),
    ssl: { rejectUnauthorized: false },
  };
}

const pgConfig = buildPgConfig(SUPABASE_DB_URL, SUPABASE_DB_PASSWORD);
const client = new pg.Client(pgConfig);
const migrationsDir = resolve(__dirname, '../supabase/migrations');

async function run() {
  await client.connect();
  console.log(`✅ Connected to ${pgConfig.host}`);

  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         serial PRIMARY KEY,
      filename   text UNIQUE NOT NULL,
      applied_at timestamptz DEFAULT now()
    )
  `);

  const applied = await client.query('SELECT filename FROM _migrations ORDER BY id');
  const appliedSet = new Set(applied.rows.map(r => r.filename));

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏩ Skipping ${file} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ Applied ${file}`);
      count++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Failed on ${file}:`, err.message);
      process.exit(1);
    }
  }

  if (count === 0) console.log('ℹ️  No new migrations to apply');
  else console.log(`✅ ${count} migration(s) applied`);

  await client.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
