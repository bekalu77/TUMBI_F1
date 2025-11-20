import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Ensure a consistent data directory at the repository root
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = path.join(dataDir, 'database.sqlite');
const sqlite = new Database(dbFile);
sqlite.pragma('journal_mode = WAL');
export const db = drizzle(sqlite, { schema });
