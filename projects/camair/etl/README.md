# Cambodia Environmental Data ETL Pipeline

This project is an automated data pipeline that fetches real-time **air quality**, **weather**, and **UV index** data from the Cambodia MEF API, streams through Kafka, processes with Apache Spark, and stores results in PostgreSQL and Parquet files — covering all 25 provinces.

## Architecture

1.  **Airflow (DAG `cambodia_environmental_ingestion`)**: Fetches data from 3 MEF API endpoints and pushes each to its own Kafka topic (`raw_air_quality`, `raw_weather`, `raw_uv`).
2.  **Kafka**: Acts as a message broker with 3 topics for raw data streams.
3.  **Spark (3 streaming jobs)**: Each job reads from its Kafka topic, parses the schema, cleans timestamps, and writes to:
    -   **PostgreSQL**: 3 tables (`processed_air_quality`, `processed_weather`, `processed_uv_index`).
    -   **Parquet**: 3 directories for long-term storage (Data Lake).
4.  **PostgreSQL**: Stores Airflow metadata and the 3 processed data tables.

## Prerequisites

-   Docker and Docker Compose installed.

## Getting Started

### 1. Build and Initialize the Environment

Run the following command to build the custom Airflow image (which includes Java and PySpark) and initialize the database:

```bash
docker compose -f docker-compose.camair.yml up airflow-init
```

### 2. Start all Services (Convenient for Development)

Once initialization is complete, start all components:

```bash
docker compose -f docker-compose.camair.yml up -d
```

### 3. Access Airflow UI

-   **URL**: [http://localhost:8080](http://localhost:8080)
-   **Username**: `admin`
-   **Password**: `admin`

### 4. Trigger the Pipeline

1.  Log in to the Airflow UI.
2.  Find the DAG named `cambodia_environmental_ingestion`.
3.  Turn the toggle to **On**.
4.  Trigger the DAG manually (or wait for the schedule).

## Monitoring and Verification

-   **Logs**: Check the logs of the `airflow-scheduler` or `airflow-webserver` to see task execution.
-   **Spark Output**: Since Spark is running with `.trigger(availableNow=True)`, it will process all data currently in Kafka and then exit. The logs will show the console output of the processed data.
-   **Data Storage**:
    -   **Parquet**: Check the `./data/processed_air_quality` folder on your host machine.
    -   **PostgreSQL**: Connect to the database using any client:
        -   **Host**: `localhost`
        -   **Port**: `5432`
        -   **Database**: `camair`
        -   **User**: `airflow`
        -   **Password**: `airflow`
        -   **Tables**: `processed_air_quality`, `processed_weather`, `processed_uv_index`

## Project Structure

-   `dags/`: Airflow DAG definitions.
-   `include/spark_jobs/`: Spark processing scripts.
-   `docker/`: Dockerfile and initialization scripts.
-   `data/`: Local storage for Parquet files and checkpoints.

## Viewing Data in Spark

To view the data processed by Spark, you can use the following steps:

1. **Run the Spark Job**
   Ensure that the Spark job has been executed and the data has been processed. The processed data will be stored in the specified output directory (e.g., `/opt/spark/data/processed_air_quality`).

2. **List the Processed Data**
   Use the following command to list the files in the processed data directory:
   ```bash
   docker exec spark-job ls -R //opt/spark/data/processed_air_quality
   ```
   This command will display all the files and directories under `processed_air_quality`.

3. **Inspect the Data**
   To inspect the contents of a specific file, you can use the `cat` command inside the container. For example:
   ```bash
   docker exec spark-job cat //opt/spark/data/processed_air_quality/part-00000-*.parquet
   ```
   Replace `part-00000-*.parquet` with the actual file name you want to inspect.

4. **Copy Data to Host Machine (Optional)**
   If you want to analyze the data outside the container, you can copy it to your host machine using the `docker cp` command:
   ```bash
   docker cp spark-job:/opt/spark/data/processed_air_quality ./processed_air_quality
   ```
   This will copy the entire `processed_air_quality` directory to your current working directory on the host machine.

5. **Analyze the Data**
   Use tools like Apache Parquet CLI, Python (with `pandas` or `pyarrow`), or any other data analysis tool to read and analyze the Parquet files. For example, using Python:
   ```python
   import pandas as pd

   df = pd.read_parquet('./processed_air_quality/part-00000-*.parquet')
   print(df.head())
   ```

By following these steps, you can view and analyze the data processed by Spark.