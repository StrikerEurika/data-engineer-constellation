import psycopg2

conn = psycopg2.connect("postgresql://airflow:airflow@localhost:5432/camair")
cur = conn.cursor()

for table in ["processed_air_quality", "processed_weather", "processed_uv_index", "provinces"]:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    count = cur.fetchone()[0]
    print(f"Table {table}: {count} rows")

cur.close()
conn.close()
