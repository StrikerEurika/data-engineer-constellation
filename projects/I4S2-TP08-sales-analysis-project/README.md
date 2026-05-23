# Exercise 2: Distributed Sales Data Analysis using PySpark

## Objectives
- Load large CSV data with PySpark
- Perform distributed analysis on 1M+ rows
- Apply grouping and aggregation
- Compare Spark vs single-node Python processing conceptually
- Visualize results with matplotlib/seaborn

## Dataset
`Retail_Transactions_Dataset.csv` — 1,000,000 retail transactions with 13 columns:
| Column | Description |
|---|---|
| `Transaction_ID` | Unique transaction identifier |
| `Date` | Timestamp of purchase |
| `Customer_Name` | Customer name |
| `Product` | List of purchased items |
| `Total_Items` | Number of items bought |
| `Total_Cost` | Total transaction amount ($) |
| `Payment_Method` | Cash, Credit Card, Debit Card, Mobile Payment |
| `City` | Store city |
| `Store_Type` | Supermarket, Department Store, Warehouse Club, etc. |
| `Discount_Applied` | Whether a discount was applied |
| `Customer_Category` | Homemaker, Professional, Student, etc. |
| `Season` | Purchase season |
| `Promotion` | Promotion type (contains `"None"` strings to clean) |

## How to Run

```bash
uv sync
uv run python main.py
```

Output: console results + two plots in `reports/`:
- `sales_by_store.png`
- `top_cities.png`

## How Spark Distributes the Work

1. **Partitioning** — Spark reads the CSV into partitions (one per core by default). Each partition is a chunk of rows stored on an executor's JVM heap, enabling parallel processing.

2. **Lazy Evaluation & DAG** — Transformations (`.withColumn`, `.groupBy`) build a directed acyclic graph (DAG) of stages. No computation happens until an action (`.count()`, `.collect()`, `.save()`) is called. The driver optimizes the DAG by pipelining narrow transformations and minimizing shuffles.

3. **Stage Splitting** — A `groupBy` or `orderBy` introduces a **wide dependency** (shuffle). Spark splits the DAG at the shuffle boundary into stages. Stage 1: read + clean (no shuffle). Stage 2: aggregate (shuffle + reduce).

4. **Task Execution** — Each partition is processed by one **task** running on a worker core. Tasks execute stage logic on their partition in parallel. For the aggregation stage, each task computes a local sum, then shuffles data so all rows for the same key land on the same executor for the final merge.

5. **Shuffle** — In `groupBy("Store_Type").agg(sum("Total_Cost"))`, Spark hashes each row by `Store_Type` and writes it to shuffle files. Executors fetch the relevant partitions from one another — this is the most expensive phase.

6. **Fault Tolerance via Lineage** — If an executor fails, Spark recomputes its lost partitions by replaying the lineage (the sequence of transformations that created them) — no manual checkpoint needed.

7. **Comparison with Pandas** — Pandas loads the full dataset into one machine's RAM and processes it on a single core. Spark distributes the same work across N cores (or N machines), each handling 1/N of the data, making it feasible for datasets that exceed a single machine's memory.
