from pyspark.sql import DataFrame
from pyspark.sql.functions import col, when


def clean(df: DataFrame) -> DataFrame:
    initial_count = df.count()

    cleaned = df.withColumn(
        "Promotion",
        when(col("Promotion") == "None", None).otherwise(col("Promotion"))
    ).dropna(subset=["Total_Cost", "Total_Items"])

    final_count = cleaned.count()
    removed = initial_count - final_count

    print(f"Cleaning summary:")
    print(f"  Rows before: {initial_count:,}")
    print(f"  Rows after:  {final_count:,}")
    print(f"  Removed:     {removed:,}")

    return cleaned
