# Cambodia Air Quality ETL Pipeline

This project is an automated data pipeline that fetches real-time air quality data from Cambodia, streams it through Kafka, processes it using Apache Spark, and stores the results in PostgreSQL and Parquet files.

## Architecture

1.  **Airflow (DAG)**: Fetches data from the MEF API and pushes it to a Kafka topic (`raw_air_quality`).
2.  **Kafka**: Acts as a message broker for the raw data stream.
3.  **Spark**: Reads the stream from Kafka, transforms the data (schema parsing, timestamp cleaning), and writes it to:
    -   **PostgreSQL**: For structured querying.
    -   **Parquet**: For long-term storage (Data Lake).
4.  **PostgreSQL**: Stores Airflow metadata and the final processed data.

## Prerequisites

-   Docker and Docker Compose installed.

## Getting Started

### 1. Build and Initialize the Environment

Run the following command to build the custom Airflow image (which includes Java and PySpark) and initialize the database:

```bash
docker-compose up airflow-init
```

### 2. Start all Services

Once initialization is complete, start all components:

```bash
docker-compose up -d
```

### 3. Access Airflow UI

-   **URL**: [http://localhost:8080](http://localhost:8080)
-   **Username**: `admin`
-   **Password**: `admin`

### 4. Trigger the Pipeline

1.  Log in to the Airflow UI.
2.  Find the DAG named `cambodia_air_quality_ingestion`.
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
        -   **Table**: `processed_air_quality`

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

## Get the Data

To "get the data" (meaning to read or use it), you have three main ways depending on what you want to
  do:

  1. Manual Export (To your Windows Desktop)
  If the volume mapping is still being difficult, you can "pull" the files out of the container        
  manually using the docker cp command.
  Run this in your PowerShell:
   1 docker cp spark-job:/opt/spark/data/processed_air_quality ./exported_data
  This will create a folder named exported_data on your computer containing all the Parquet files.     

  2. Reading the Data with Python (Pandas)
  Parquet is a binary format (you can't read it in Notepad). The easiest way to see the actual data is
  using Pandas. If you have Python installed locally, you can do this:

   1 import pandas as pd
   2
   3 # Once the volume is working or you've used 'docker cp'
   4 df = pd.read_parquet('./camair-etl/data/processed_air_quality')
   5 print(df.head())
  Note: You might need to install pip install pandas pyarrow first.

  3. The "Automatic" Way (Fixing the Volume)
  If you follow the "Fix" from my previous message (Stop → Delete local data folder → Restart), the
  Parquet files will automatically appear in your Windows folder:
  D:\Schools\ITC\Year 4\Semester 2\de\camair\camair-etl\data\processed_air_quality

  Once they are there, any tool that supports Parquet (like VS Code with a "Parquet Viewer" extension)
  can open them directly.

  4. Querying inside the container (Quick Look)
  If you just want to see a few rows of the data right now without moving files, you can tell the
  running Spark container to read its own files and print them:

   1 docker exec spark-job /opt/spark/bin/spark-submit --execute
     "spark.read.parquet('/opt/spark/data/processed_air_quality').show()"