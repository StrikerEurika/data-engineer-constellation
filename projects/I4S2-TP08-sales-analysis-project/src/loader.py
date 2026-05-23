from pathlib import Path

from pyspark.sql import DataFrame, SparkSession


def create_spark_session(app_name: str = "SalesAnalysis") -> SparkSession:
    return (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]")
        .config("spark.sql.shuffle.partitions", "8")
        .getOrCreate()
    )


def load_csv(spark: SparkSession, csv_path: str) -> DataFrame:
    path = Path(csv_path).resolve()
    if not path.exists():
        msg = f"CSV file not found at {path}"
        raise FileNotFoundError(msg)
    return spark.read.csv(str(path), header=True, inferSchema=True)
