#!/usr/bin/env node
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.dev first, fallback to .env.local
const envFile = process.env.NODE_ENV === 'dev'
  ? resolve(__dirname, '../.env.dev')
  : resolve(__dirname, '../.env.local');

dotenv.config({ path: envFile });
console.log(`ℹ️  Loaded env from: ${envFile}`);

const { SUPABASE_DB_URL, SUPABASE_DB_PASSWORD } = process.env;

if (!SUPABASE_DB_URL) {
  console.error('❌ SUPABASE_DB_URL is not set in env file');
  process.exit(1);
}

const connectionString = SUPABASE_DB_PASSWORD
  ? SUPABASE_DB_URL.replace('[YOUR-PASSWORD]', SUPABASE_DB_PASSWORD)
  : SUPABASE_DB_URL;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

const migrationsDir = resolve(__dirname, '../supabase/migrations');

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase');

  // Track applied migrations
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id        serial PRIMARY KEY,
      filename  text UNIQUE NOT NULL,
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
