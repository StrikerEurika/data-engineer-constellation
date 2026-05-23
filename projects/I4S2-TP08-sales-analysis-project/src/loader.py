from pathlib import Path

from pyspark.sql import DataFrame, SparkSession

# create spark session
def create_spark_session(app_name: str = "SalesAnalysis") -> SparkSession:
    return (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]") # use all available cores for local machine
        .config("spark.sql.shuffle.partitions", "8") # limits shuffle partitions for small datasets
        .getOrCreate()
    )

# load data
def load_csv(spark: SparkSession, csv_path: str) -> DataFrame:
    path = Path(csv_path).resolve()
    if not path.exists():
        msg = f"CSV file not found at {path}"
        raise FileNotFoundError(msg)
    return spark.read.csv(str(path), header=True, inferSchema=True)
