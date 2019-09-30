import * as dotenv from "dotenv";
import * as benchmarks from "./benchmarks";
import { ColumnOperationName, ColumnUsername, ColumnUserRole } from "./constants";
import { down, up } from "./migration";

(async () => {

  const result = dotenv.config();

  if (result.error) {
    throw result.error;
  }

  const repeat = process.env.SAMPLE ? parseInt(process.env.SAMPLE, 10) : 10;
  await up();

  const groupBys = [ColumnUsername, ColumnUserRole, ColumnOperationName];
  console.log([
    await benchmarks.benchmarkCubeGroupBy(repeat),
    await benchmarks.benchmarkDynamicCubeGroupBy(repeat),
    await benchmarks.benchmarkDynamicGroupByFunction(groupBys, repeat),
    await benchmarks.dynamicGroupByNodejs(groupBys, repeat),
    await benchmarks.dynamicGroupByPGSQL(groupBys, repeat),
  ]);

  if (process.env.NO_CACHE) {
    await down();
  }
})();
