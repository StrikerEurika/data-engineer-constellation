from src.cleaner import clean
from src.loader import create_spark_session, load_csv
from src.analyzer import analyze
from src.visualizer import plot_sales_by_store, plot_top_cities

DATA_PATH = "data/Retail_Transactions_Dataset.csv"


def main() -> None:
    spark = create_spark_session()
    try:
        raw = load_csv(spark, DATA_PATH)
        df = clean(raw)
        result = analyze(df)
        plot_sales_by_store(result.store_sales_pdf)
        plot_top_cities(result.city_sales_pdf)
    finally:
        spark.stop()


if __name__ == "__main__":
    main()
