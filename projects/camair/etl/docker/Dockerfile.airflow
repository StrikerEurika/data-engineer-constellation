FROM apache/airflow:2.8.1
USER root
RUN apt-get update && apt-get install -y default-jdk
USER airflow
RUN pip install --no-cache-dir --user kafka-python requests pyspark