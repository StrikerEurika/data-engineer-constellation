from dataclasses import dataclass

import pandas as pd
from pyspark.sql import DataFrame
from pyspark.sql.functions import avg, col, desc, sum


@dataclass
class AnalysisResult:
    total_sales: float
    top_store: str
    top_store_sales: float
    avg_sales: float
    store_sales_pdf: pd.DataFrame
    city_sales_pdf: pd.DataFrame


def analyze(df: DataFrame) -> AnalysisResult:
    total_sales = df.select(sum("Total_Cost")).collect()[0][0] or 0.0

    top_store_row = (
        df.groupBy("Store_Type")
        .agg(sum("Total_Cost").alias("total"))
        .orderBy(desc("total"))
        .first()
    )
    top_store = top_store_row["Store_Type"] if top_store_row else "N/A"
    top_store_sales = top_store_row["total"] if top_store_row else 0.0

    avg_sales = df.select(avg("Total_Cost")).collect()[0][0] or 0.0

    store_sales = (
        df.groupBy("Store_Type")
        .agg(sum("Total_Cost").alias("total"))
        .orderBy(desc("total"))
        .toPandas()
    )

    city_sales = (
        df.groupBy("City")
        .agg(sum("Total_Cost").alias("total"))
        .orderBy(desc("total"))
        .limit(10)
        .toPandas()
    )

    print(f"\nResults:")
    print(f"  Total sales:      ${total_sales:,.2f}")
    print(f"  Top-selling store: {top_store} (${top_store_sales:,.2f})")
    print(f"  Average sale:     ${avg_sales:,.2f}")

    return AnalysisResult(
        total_sales=total_sales,
        top_store=top_store,
        top_store_sales=top_store_sales,
        avg_sales=avg_sales,
        store_sales_pdf=store_sales,
        city_sales_pdf=city_sales,
    )
