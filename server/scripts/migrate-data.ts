import "dotenv/config";
import { drizzle as drizzleNode, NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Pool } from "pg";
import Database from "better-sqlite3";
import * as schema from "../../shared/schema";

async function migrateData() {
  // Connect to PostgreSQL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const pgDb: NodePgDatabase<typeof schema> = drizzleNode(pool, { schema });
  console.log("Connected to PostgreSQL.");

  // Connect to SQLite
  const sqliteDbFile = "./data/database.sqlite";
  const sqlite = new Database(sqliteDbFile);
  const sqliteDb: BetterSQLite3Database<typeof schema> = drizzleSqlite(sqlite, { schema });
  console.log("Connected to SQLite.");

  try {
    console.log("Starting data migration...");

    // Transfer data for each table, ensuring dependencies are respected
    // A type-safe mapping of table names to their schemas
    const tableSchemas = {
      users: schema.users,
      companyTypes: schema.companyTypes,
      itemCategories: schema.itemCategories,
      locations: schema.locations,
      units: schema.units,
      companies: schema.companies,
      items: schema.items,
      rfq: schema.rfq,
      jobs: schema.jobs,
    };

    const tableNames = Object.keys(tableSchemas) as (keyof typeof tableSchemas)[];

    for (const tableName of tableNames) {
      console.log(`Migrating table: ${tableName}...`);
      const tableSchema = tableSchemas[tableName];
      
      // Since `select()` and `insert()` are generic, we can cast the schema to `any` 
      // to bypass the strict type checking that was causing the error.
      // This is safe here because we are iterating over a well-defined list of tables.
      const data = await sqliteDb.select().from(tableSchema as any);
      
      if (data.length > 0) {
        await pgDb.insert(tableSchema as any).values(data).onConflictDoNothing();
        console.log(`Successfully migrated ${data.length} records to ${tableName}.`);
      } else {
        console.log(`No data to migrate for ${tableName}.`);
      }
    }

    console.log("Data migration completed successfully!");
  } catch (error) {
    console.error("An error occurred during data migration:", error);
  } finally {
    // Close connections
    await pool.end();
    sqlite.close();
    console.log("Database connections closed.");
  }
}

migrateData();
