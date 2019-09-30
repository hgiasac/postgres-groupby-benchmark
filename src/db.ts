import { Pool } from "pg";
import { roundNumber } from "./util";

let pool: Pool;

export const getPool = () => {
  if (!pool) {
    pool = new Pool();
  }

  return pool;
};

export interface IExplainResult {
  planningTime: number;
  pgExecutionTime: number;
  executionTime: number;
}

export function explain(sql: string): Promise<IExplainResult> {

  const start = new Date().getTime();
  const explainSQL = `EXPLAIN (FORMAT JSON, ANALYZE) (${sql});`;

  return getPool().query(explainSQL)
    .then(({ rows }) => {
      const plan = rows[0]["QUERY PLAN"][0];
      return ({
        planningTime: plan["Planning Time"],
        pgExecutionTime: plan["Execution Time"],
        executionTime: new Date().getTime() - start,
      });
    });
}

export interface IBenchmarkResult extends IExplainResult {
  name: string;
}

export async function benchmarkExplain(name: string, sql: string, repeat: number): Promise<IBenchmarkResult> {
  console.log("Benchmarking", name, "...");

  const avgFn = (x: number) => roundNumber(x / repeat, 3);
  const result: IExplainResult = {
    planningTime: 0,
    pgExecutionTime: 0,
    executionTime: 0,
  };

  for (let i = 0; i < repeat; i++) {
    const temp = await explain(sql);
    result.planningTime = result.planningTime + temp.planningTime;
    result.pgExecutionTime = result.pgExecutionTime + temp.pgExecutionTime;
    result.executionTime = result.executionTime + temp.executionTime;
  }

  return {
    name,
    planningTime: avgFn(result.planningTime),
    pgExecutionTime: avgFn(result.pgExecutionTime),
    executionTime: avgFn(result.executionTime),
  };
}
