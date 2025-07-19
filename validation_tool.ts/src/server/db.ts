import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "app_data.db");

// You can use a verbose instance for debugging purposes
let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb(): Promise<
  Database<sqlite3.Database, sqlite3.Statement>
> {
  if (!dbInstance) {
    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
  }
  return dbInstance;
}

export async function initDb() {
  console.log("Initializing database schema...");
  const db = await getDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK(status IN ('source', 'in_progress', 'validated')),
      data TEXT NOT NULL,
      source_data TEXT NOT NULL
    );
  `);
  console.log("Database initialized.");
}

export default getDb;
