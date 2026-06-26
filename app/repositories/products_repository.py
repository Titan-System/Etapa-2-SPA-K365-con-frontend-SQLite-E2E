from app.db import get_connection, row_to_dict


def get_all_products():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, name, category, price, description, stock, image_url
            FROM products
            ORDER BY id ASC
            """
        ).fetchall()
    return [row_to_dict(row) for row in rows]


def get_product_by_id(product_id):
    with get_connection() as conn:
        row = conn.execute(
            """
            SELECT id, name, category, price, description, stock, image_url
            FROM products
            WHERE id = ?
            """,
            (product_id,),
        ).fetchone()
    return row_to_dict(row)
