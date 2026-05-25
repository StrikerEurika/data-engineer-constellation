from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp, from_json
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, LongType, BooleanType

POSTGRES_URL = "jdbc:postgresql://postgres:5432/camair"
POSTGRES_PROPERTIES = {
    "user": "airflow",
    "password": "airflow",
    "driver": "org.postgresql.Driver"
}

spark = SparkSession.builder \
    .appName("CambodiaWeatherProcessor") \
    .config(
        "spark.jars.packages",
        "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1,org.postgresql:postgresql:42.6.0"
    ) \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")

condition_schema = StructType([
    StructField("text", StringType(), True),
    StructField("icon", StringType(), True),
    StructField("code", IntegerType(), True),
])

weather_schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),
    StructField("temp_c", DoubleType(), True),
    StructField("temp_f", DoubleType(), True),
    StructField("feelslike_c", DoubleType(), True),
    StructField("feelslike_f", DoubleType(), True),
    StructField("wind_mph", DoubleType(), True),
    StructField("wind_kph", DoubleType(), True),
    StructField("wind_degree", IntegerType(), True),
    StructField("wind_dir", StringType(), True),
    StructField("pressure_mb", DoubleType(), True),
    StructField("pressure_in", DoubleType(), True),
    StructField("precip_mm", DoubleType(), True),
    StructField("precip_in", DoubleType(), True),
    StructField("humidity", IntegerType(), True),
    StructField("cloud", IntegerType(), True),
    StructField("vis_km", DoubleType(), True),
    StructField("vis_miles", DoubleType(), True),
    StructField("uv", DoubleType(), True),
    StructField("gust_mph", DoubleType(), True),
    StructField("gust_kph", DoubleType(), True),
    StructField("is_day", BooleanType(), True),
    StructField("condition", condition_schema, True),
    StructField("last_updated", StringType(), True),
    StructField("last_updated_epoch", LongType(), True),
    StructField("created_at", StringType(), True),
])

raw_kafka_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:29092") \
    .option("subscribe", "raw_weather") \
    .option("startingOffsets", "earliest") \
    .option("failOnDataLoss", "false") \
    .load()

parsed_df = raw_kafka_df.selectExpr("CAST(value AS STRING) as json_string") \
    .select(from_json(col("json_string"), weather_schema).alias("data")) \
    .select("data.*")

cleaned_df = parsed_df \
    .withColumn("created_at_ts", to_timestamp(col("created_at"), "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX")) \
    .withColumn("condition_text", col("condition.text")) \
    .withColumn("condition_icon", col("condition.icon")) \
    .withColumn("condition_code", col("condition.code")) \
    .drop("condition")

console_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

file_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/opt/spark/data/processed_weather") \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/weather") \
    .start()


def write_to_postgres(batch_df, batch_id):
    try:
        if batch_df.count() > 0:
            batch_df.write \
                .jdbc(
                    url=POSTGRES_URL,
                    table="processed_weather",
                    mode="append",
                    properties=POSTGRES_PROPERTIES
                )
            print(f"Batch {batch_id}: wrote {batch_df.count()} weather rows to PostgreSQL.")
    except Exception as e:
        print(f"Error writing weather batch {batch_id} to PostgreSQL: {e}")


postgres_query = cleaned_df.writeStream \
    .outputMode("append") \
    .foreachBatch(write_to_postgres) \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/weather_pg") \
    .start()

spark.streams.awaitAnyTermination()
