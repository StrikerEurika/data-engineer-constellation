from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp, from_json
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, LongType

POSTGRES_URL = "jdbc:postgresql://postgres:5432/camair"
POSTGRES_PROPERTIES = {
    "user": "airflow",
    "password": "airflow",
    "driver": "org.postgresql.Driver"
}

spark = SparkSession.builder \
    .appName("CambodiaUVProcessor") \
    .config(
        "spark.jars.packages",
        "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1,org.postgresql:postgresql:42.6.0"
    ) \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

uv_schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("uv", DoubleType(), True),
    StructField("last_updated", StringType(), True),
    StructField("last_updated_epoch", LongType(), True),
    StructField("created_at", StringType(), True),
])

raw_kafka_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:29092") \
    .option("subscribe", "raw_uv") \
    .option("startingOffsets", "earliest") \
    .option("failOnDataLoss", "false") \
    .load()

parsed_df = raw_kafka_df.selectExpr("CAST(value AS STRING) as json_string") \
    .select(from_json(col("json_string"), uv_schema).alias("data")) \
    .select("data.*")

cleaned_df = parsed_df.withColumn(
    "created_at_ts", to_timestamp(col("created_at"), "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX"))

console_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

file_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/opt/spark/data/processed_uv") \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/uv") \
    .start()


def write_to_postgres(batch_df, batch_id):
    try:
        if batch_df.count() > 0:
            batch_df.write \
                .jdbc(
                    url=POSTGRES_URL,
                    table="processed_uv_index",
                    mode="append",
                    properties=POSTGRES_PROPERTIES
                )
            print(f"Batch {batch_id}: wrote {batch_df.count()} UV rows to PostgreSQL.")
    except Exception as e:
        print(f"Error writing UV batch {batch_id} to PostgreSQL: {e}")


postgres_query = cleaned_df.writeStream \
    .outputMode("append") \
    .foreachBatch(write_to_postgres) \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/uv_pg") \
    .start()

spark.streams.awaitAnyTermination()
