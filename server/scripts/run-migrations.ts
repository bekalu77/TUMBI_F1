import "dotenv/config";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  console.log("Connected to PostgreSQL.");

  try {
    const migrationsDir = path.join(process.cwd(), "drizzle");
    const sqlFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith(".sql"));

    // Sort files to run in order
    sqlFiles.sort();

    if (sqlFiles.length === 0) {
      console.log("No migration files found.");
      return;
    }

    for (const file of sqlFiles) {
      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      await client.query(sql);
      console.log(`Successfully applied ${file}.`);
    }

    console.log("All migrations applied successfully!");
  } catch (error) {
    console.error("An error occurred during migration:", error);
  } finally {
    client.release();
    await pool.end();
    console.log("Database connection closed.");
  }
}

runMigrations();
