import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dataDir = resolve(root, 'data');
const databasePath = resolve(dataDir, 'sleepflow.db');
const migrationPath = resolve(root, 'prisma', 'migrations', '20260717_initial_schema', 'migration.sql');

mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('CREATE TABLE IF NOT EXISTS "_sleepflow_schema_migrations" ("name" TEXT PRIMARY KEY, "appliedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);');
const applied = db.prepare('SELECT 1 FROM "_sleepflow_schema_migrations" WHERE "name" = ?').get('20260717_initial_schema');

if (!applied) {
  db.exec(readFileSync(migrationPath, 'utf8'));
  db.prepare('INSERT INTO "_sleepflow_schema_migrations" ("name") VALUES (?)').run('20260717_initial_schema');
}

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all();
console.log(JSON.stringify({ databasePath, tables: tables.map(({ name }) => name), migrated: !applied }));
db.close();
