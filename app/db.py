import os
import sqlite3
from pathlib import Path
from app.data.products_seed import PRODUCTS_SEED

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "database" / "k365.sqlite"


def get_database_path():
    custom_path = os.environ.get("K365_DB_PATH")
    if custom_path:
        return Path(custom_path)
    return DEFAULT_DB_PATH


def get_connection():
    db_path = get_database_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def row_to_dict(row):
    if row is None:
        return None
    return dict(row)


def init_db():
    with get_connection() as conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                description TEXT NOT NULL,
                stock INTEGER NOT NULL,
                image_url TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cart_items (
                product_id INTEGER PRIMARY KEY,
                quantity INTEGER NOT NULL,
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                total INTEGER NOT NULL,
                items_count INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                unit_price INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                subtotal INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
            """
        )

        for product in PRODUCTS_SEED:
            conn.execute(
                """
                INSERT INTO products
                    (id, name, category, price, description, stock, image_url)
                VALUES
                    (:id, :name, :category, :price, :description, :stock, :image_url)
                ON CONFLICT(id) DO UPDATE SET
                    name = excluded.name,
                    category = excluded.category,
                    price = excluded.price,
                    description = excluded.description,
                    stock = excluded.stock,
                    image_url = excluded.image_url
                """,
                product,
            )
        conn.commit()
