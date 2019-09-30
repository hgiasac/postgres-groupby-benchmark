import { Pool, QueryResult } from "pg";
import { getPool } from "../db";

export function clearTables(db: Pool): Promise<QueryResult<any>> {
  return db.query("DROP TABLE logs;");
}
export async function down() {
  console.log("Clearing data");
  const db = getPool();
  await clearTables(db);
  console.log("Data is clean");
}
