from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"


def plot_sales_by_store(store_sales: pd.DataFrame) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / "sales_by_store.png"

    plt.figure(figsize=(10, 6))
    sns.barplot(data=store_sales, x="Store_Type", y="total", hue="Store_Type", palette="viridis", legend=False)
    plt.title("Total Sales by Store Type")
    plt.xlabel("Store Type")
    plt.ylabel("Total Sales ($)")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(str(path))
    plt.close()

    print(f"  Plot saved: {path}")
    return path


def plot_top_cities(city_sales: pd.DataFrame) -> Path:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / "top_cities.png"

    plt.figure(figsize=(10, 6))
    sns.barplot(
        data=city_sales.sort_values("total"),
        x="total",
        y="City",
        hue="City",
        palette="magma",
        legend=False,
    )
    plt.title("Top 10 Cities by Total Sales")
    plt.xlabel("Total Sales ($)")
    plt.ylabel("City")
    plt.tight_layout()
    plt.savefig(str(path))
    plt.close()

    print(f"  Plot saved: {path}")
    return path
