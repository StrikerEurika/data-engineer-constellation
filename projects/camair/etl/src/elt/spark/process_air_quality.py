from pyspark.sql import SparkSession
from pyspark.sql.functions import col, to_timestamp, from_json
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, IntegerType, LongType

# Database connection config
POSTGRES_URL = "jdbc:postgresql://postgres:5432/camair"
POSTGRES_PROPERTIES = {
    "user": "airflow",
    "password": "airflow",
    "driver": "org.postgresql.Driver"
}

# 1. Initialize the Spark Session
# This is our connection to the Spark engine
spark = SparkSession.builder \
    .appName("CambodiaAirQualityProcessor") \
    .config(
        "spark.jars.packages",
        "org.apache.spark:spark-sql-kafka-0-10_2.12:3.4.1,org.postgresql:postgresql:42.6.0"
    ) \
    .getOrCreate()

# We want to see warnings and errors, but not all the background noise
spark.sparkContext.setLogLevel("WARN")

# 2. Define the exact structure (Schema) of our incoming data
# Spark needs to know exactly what the JSON looks like to process it efficiently
air_quality_schema = StructType([
    StructField("id", IntegerType(), True),
    StructField("name", StringType(), True),  # Province name (e.g., "Kratie")
    StructField("co", DoubleType(), True),
    StructField("no2", DoubleType(), True),
    StructField("o3", DoubleType(), True),
    StructField("so2", DoubleType(), True),
    StructField("pm2_5", DoubleType(), True),
    StructField("pm10", DoubleType(), True),
    StructField("us_epa_index", IntegerType(), True),
    StructField("gb_defra_index", IntegerType(), True),
    StructField("last_updated", StringType(), True),
    StructField("last_updated_epoch", LongType(), True),
    StructField("created_at", StringType(), True)
])

print("Connecting to Kafka to read the stream...")

# 3. Read the continuous stream from Kafka
# NOTE: We use 'kafka:29092' (internal Docker network), NOT 'localhost:9092'
raw_kafka_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:29092") \
    .option("subscribe", "raw_air_quality") \
    .option("startingOffsets", "earliest") \
    .option("failOnDataLoss", "false") \
    .load()

# 4. Clean and Transform the Data
# Kafka stores the message in a column called 'value' as raw bytes.
# We cast it to a string, then parse it into separate columns using our schema.
parsed_df = raw_kafka_df.selectExpr("CAST(value AS STRING) as json_string") \
    .select(from_json(col("json_string"), air_quality_schema).alias("data")) \
    .select("data.*")

# Let's do a little bit of cleaning: convert the string timestamp into a real Spark timestamp
# We use ISO 8601 format for robustness
cleaned_df = parsed_df.withColumn(
    "created_at_ts", to_timestamp(col("created_at"), "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX"))

# 5. Write the Output (The "Sink")
# In a real environment, you might write to PostgreSQL here.
# For testing our pipeline, let's write it to our local "Data Lake" (the ./etl/data folder) as Parquet files,
# AND print it to the console so we can watch it work.

# Sink 1: Console Output (Great for debugging)
console_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("console") \
    .start()

# Sink 2: Parquet Files (Simulating Hadoop/HDFS storage)
# NOTE: Enabled to allow viewing processed data in the local filesystem
file_query = cleaned_df.writeStream \
    .outputMode("append") \
    .format("parquet") \
    .option("path", "/opt/spark/data/processed_air_quality") \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/air_quality") \
    .start()

# Sink 3: PostgreSQL (so the API can actually query the data!)
def write_to_postgres(batch_df, batch_id):
    """Write each micro-batch to the PostgreSQL processed_air_quality table."""
    try:
        if batch_df.count() > 0:
            # We use .save() which handles table creation more gracefully in some cases
            # but .jdbc() with mode("append") is fine if the table exists.
            # To be safe, we'll ensure it tries to append and we catch errors or use create if needed.
            batch_df.write \
                .jdbc(
                    url=POSTGRES_URL,
                    table="processed_air_quality",
                    mode="append",
                    properties=POSTGRES_PROPERTIES
                )
            print(f"Batch {batch_id}: wrote {batch_df.count()} rows to PostgreSQL.")
    except Exception as e:
        print(f"Error writing batch {batch_id} to PostgreSQL: {e}")

postgres_query = cleaned_df.writeStream \
    .outputMode("append") \
    .foreachBatch(write_to_postgres) \
    .option("checkpointLocation", "/opt/spark/data/checkpoints/air_quality_pg") \
    .start()

# 6. Keep the queries running continuously
spark.streams.awaitAnyTermination()
