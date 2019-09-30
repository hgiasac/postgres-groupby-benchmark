# PostgreSQL Group By benchmark

## Requirement
- Node.js > 8
- PostgreSQL (or use docker)

## How to run

Install packages, copy file `dotenv` to `.env`, change configuration then run:

```sh
npm start
```

## Benchmark

### Hardware Specifications

- Thinkpad X1 Extreme Gen 1 Laptop
- CPU Intel i7-8850H 2.60GHz
- RAM 32GB 2666 MHz
- SSD 1TB PCIe-NVMe OPAL2.0 M.2

### Benchmark Result

*Note*: Benchmark without index, execution time in milliseconds

1. 1,000,000 rows

| Name | Planning Time | PG Exec Time | Total Exec Time | Ratio |
| ---- | ------------- | ------------ | --------------- | ----- |
| CUBE order by | 0.093 | 2465.993 | 2466.9 | 135.98% |
| Dynamic CUBE order by | 0.111 | 2442.221 | 2442.9 |134.66% |
| Dynamic Group By SQL function | 0.043 | 2022.844 | 2023.5 | 111.54% |
| Dynamic Group By Node.js query builder | 0.043 | 1813.477 | 1814.1 | 100% |
| Dynamic Group By plpgsql query builder | 0.011 | 2032.595 | 2033.1 | 112.07% |

2. 10,000,000 rows

| Name | Planning Time | PG Exec Time | Total Exec Time | Ratio |
| ---- | ------------- | ------------ | --------------- | ----- |
| CUBE order by | 0.11 | 29446.414 | 29447.2 | 121.7% |
| Dynamic CUBE order by | 0.107 | 27729.667 | 27730.3 |114.6% |
| Dynamic Group By SQL function | 0.013 | 25670.605 | 25671.1 | 106.1% |
| Dynamic Group By Node.js query builder | 0.04 | 24195.336 | 24196 | 100% |
| Dynamic Group By plpgsql query builder | 0.013 | 26650.873 | 26651.4 | 110.15% |
