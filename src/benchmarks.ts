import { ColumnOperationName, ColumnStatusCode, ColumnUsername, ColumnUserRole, LogColumn } from "./constants";
import { benchmarkExplain, IBenchmarkResult } from "./db";

export const CUBE_GROUP_BY = `
  SELECT
      username,
      user_role,
      operation_name,
      SUM(error_count) as error_count,
      MAX(request_count) as request_count
  FROM (
    SELECT DISTINCT
      username,
      user_role,
      operation_name,
      COUNT(*) FILTER(WHERE is_error) OVER (PARTITION BY username, user_role, operation_name) AS error_count,
      COUNT(*) OVER (PARTITION BY username, user_role, operation_name) AS request_count
    FROM logs
  ) r1 GROUP BY CUBE(username, user_role, operation_name)
`;

export function benchmarkCubeGroupBy(repeat: number): Promise<IBenchmarkResult> {
  return benchmarkExplain(
    "CUBE order by",
    CUBE_GROUP_BY,
    repeat,
  );
}

export function benchmarkDynamicCubeGroupBy(repeat: number): Promise<IBenchmarkResult> {
  return benchmarkExplain(
    "Dynamic CUBE order by",
    ` SELECT * FROM (${CUBE_GROUP_BY}) r2
        WHERE username IS NOT NULL
        AND user_role IS NOT NULL
        AND operation_name IS NOT NULL
    `,
    repeat,
  );
}

export function benchmarkDynamicGroupByFunction(groupBys: LogColumn[], repeat: number): Promise<IBenchmarkResult> {
  return benchmarkExplain(
    "Dynamic Group By SQL function",
    `SELECT search_usage_metrics('{${groupBys.join(", ")}}')`,
    repeat,
  );
}

export function dynamicGroupByBuilder(groupBys: LogColumn[]): string {
  const selectColFn = (col: LogColumn): string =>
    groupBys.includes(col) ? col : `NULL AS ${col}`;
  const groupByWithoutStatusCode = groupBys.filter((s) => s !== ColumnStatusCode);

  const selectCols = [
    ColumnUsername,
    ColumnUserRole,
    ColumnOperationName,
    ColumnStatusCode,
  ].map(selectColFn)
  .concat([
    `COUNT(*) FILTER (WHERE is_error) OVER (PARTITION BY ${groupBys.join(", ")})`,
    `COUNT(*) OVER (PARTITION BY ${groupByWithoutStatusCode.join(", ")})`,
  ]).join(", ");

  return `SELECT ${selectCols} FROM logs`;
}

export function dynamicGroupByNodejs(groupBys: LogColumn[], repeat: number): Promise<IBenchmarkResult> {
  return benchmarkExplain(
    "Dynamic Group By Node.js query builder",
    dynamicGroupByBuilder(groupBys),
    repeat,
  );
}

export function dynamicGroupByPGSQL(groupBys: LogColumn[], repeat: number): Promise<IBenchmarkResult> {
  return benchmarkExplain(
    "Dynamic Group By plpgsql query builder",
    `SELECT search_usage_metrics_gen('{${groupBys.join(", ")}}')`,
    repeat,
  );
}
