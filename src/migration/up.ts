import { Pool, QueryResult } from "pg";
import { randomOperationName, randomStatusCode, randomUserName, randomUserRole } from "../constants";
import { getPool } from "../db";

const fixtureSize = () => process.env.FIXTURE_SIZE ? parseInt(process.env.FIXTURE_SIZE, 10) : 1;

function createTables(db: Pool): Promise<QueryResult<any>> {
  console.log("Create tables");
  const sql = `
    CREATE TABLE IF NOT EXISTS logs (
      id serial PRIMARY KEY,
      username text,
      user_role text,
      operation_name text,
      is_error boolean,
      status_code int
    );`;

  return db.query(sql);
}

async function insertLogs(db: Pool): Promise<void> {
  console.log("Inserting logs...");
  const size = fixtureSize();
  const sql = "INSERT INTO logs (username, user_role, operation_name, is_error, status_code) VALUES ";
  for (let i = 0; i < size; i++) {
    const values = [];
    for (let j = 0; j < 1000000; j++) {

      const isError = j % 2 === 1 ? "true" : "false";
      values.push(`('${randomUserName()}', '${randomUserRole()}', '${randomOperationName()}', ${isError}, ${randomStatusCode()}) `);
    }
    await db.query(sql + values.join(", "));
  }
  console.log("Inserted logs successfully!");

}

export const USAGE_METRICS_TABLE = `
  CREATE TABLE IF NOT EXISTS usage_metrics (
    username text,
    user_role text,
    operation_name text,
    status_code int,
    error_count bigint,
    request_count bigint
  );
`;

const groupByCond = (name: string): string =>
  `(('${name}' = ANY(group_by) AND ${name} IS NOT NULL)
    OR (NOT ('{${name}}' <@ group_by) AND ${name} IS NULL))`;

export const DYNAMIC_GROUP_BY_FUNCTION = `
CREATE OR REPLACE FUNCTION search_usage_metrics(group_by text[])
  RETURNS SETOF usage_metrics
  LANGUAGE sql
  STABLE
  AS $function$
  SELECT *
  FROM (
      SELECT
      username,
      user_role,
      operation_name,
      NULL::int as status_code,
      SUM(error_count)::bigint as error_count,
      SUM(request_count)::bigint as request_count
    FROM (
      SELECT DISTINCT
        username,
        user_role,
        operation_name,
        COUNT(*) FILTER(WHERE is_error) OVER (PARTITION BY username, user_role, operation_name) AS error_count,
        COUNT(*) OVER (PARTITION BY username, user_role, operation_name) AS request_count
      FROM logs
      ) r1 GROUP BY CUBE(username, user_role, operation_name)
    ) r2 WHERE ${groupByCond("username")}
      AND ${groupByCond("user_role")}
      AND ${groupByCond("operation_name")};
  $function$;
`;

// SELECT * from search_usage_metrics_gen('{username, user_role}');
export const DYNAMIC_GROUP_BY_SQL_GEN_FUNCTION = `
CREATE OR REPLACE FUNCTION search_usage_metrics_gen(group_by text[])
  RETURNS SETOF usage_metrics
  LANGUAGE plpgsql
  STABLE
  AS $function$
  DECLARE
  col text;
  sql text;
  BEGIN
    sql := 'SELECT DISTINCT ';
    FOREACH col IN ARRAY ARRAY['username', 'user_role', 'operation_name']
    LOOP
      sql := sql || (CASE WHEN (col = ANY(group_by)) THEN (col || ', ') ELSE ('NULL as ' || col || ', ') END);
    END LOOP;
    sql := sql || 'NULL::int AS status_code, '
    || ('(COUNT(*) FILTER (WHERE is_error) OVER (PARTITION BY ' || array_to_string(group_by, ',') || '))::bigint, ')
    || ('(COUNT(*) OVER (PARTITION BY ' || array_to_string(array_remove(group_by, 'status_code'), ',') || '))::bigint');
    sql := sql || ' FROM logs';

    RETURN QUERY EXECUTE sql;
  END;
  $function$;
`;

export async function up() {
  const db = getPool();
  await createTables(db);
  const result = await db.query("SELECT COUNT(*)::int as count FROM logs;");
  if (result.rows[0].count === 0) {
    await insertLogs(db);
  }
  await db.query(USAGE_METRICS_TABLE);
  await db.query(DYNAMIC_GROUP_BY_FUNCTION);
  await db.query(DYNAMIC_GROUP_BY_SQL_GEN_FUNCTION);
}
