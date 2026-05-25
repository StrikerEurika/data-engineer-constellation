import psycopg2
import psycopg2.extras
from config import DB_CONFIG

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def query_db(query: str, params: tuple | None = None) -> list[dict]:
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(query, params or ())
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.OperationalError:
        return []

def fetch_latest(table: str, columns: list[str]) -> list[dict]:
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cols_str = ", ".join(columns)
        cursor.execute(f"""
            SELECT DISTINCT ON (name)
                {cols_str}
            FROM {table}
            ORDER BY name, created_at DESC
        """)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(row) for row in rows]
    except psycopg2.OperationalError:
        return []
