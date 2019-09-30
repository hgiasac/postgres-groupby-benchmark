export function roundNumber(inp: number, precision = 2): number {
  const pow = 10 ** precision;
  return Math.round(inp * pow) / pow;
}
