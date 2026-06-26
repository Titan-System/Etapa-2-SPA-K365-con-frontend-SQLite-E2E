from app.db import get_connection
from app.repositories.products_repository import get_product_by_id


def clear_cart():
    with get_connection() as conn:
        conn.execute("DELETE FROM cart_items")
        conn.commit()


def add_item(product_id, quantity=1):
    product = get_product_by_id(product_id)

    if product is None:
        return None, "PRODUCT_NOT_FOUND"

    if not isinstance(quantity, int) or quantity <= 0:
        return None, "INVALID_QUANTITY"

    with get_connection() as conn:
        row = conn.execute(
            "SELECT quantity FROM cart_items WHERE product_id = ?",
            (product_id,),
        ).fetchone()
        current_quantity = row["quantity"] if row else 0
        new_quantity = current_quantity + quantity

        if new_quantity > product["stock"]:
            return None, "INSUFFICIENT_STOCK"

        conn.execute(
            """
            INSERT INTO cart_items (product_id, quantity)
            VALUES (?, ?)
            ON CONFLICT(product_id) DO UPDATE SET quantity = excluded.quantity
            """,
            (product_id, new_quantity),
        )
        conn.commit()

    return get_cart(), None


def remove_item(product_id):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT product_id FROM cart_items WHERE product_id = ?",
            (product_id,),
        ).fetchone()

        if row is None:
            return None, "ITEM_NOT_IN_CART"

        conn.execute("DELETE FROM cart_items WHERE product_id = ?", (product_id,))
        conn.commit()

    return get_cart(), None


def get_cart():
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT
                p.id,
                p.name,
                p.category,
                p.price,
                p.description,
                p.stock,
                p.image_url,
                c.quantity
            FROM cart_items c
            INNER JOIN products p ON p.id = c.product_id
            ORDER BY p.id ASC
            """
        ).fetchall()

    items = []
    total = 0
    items_count = 0

    for row in rows:
        product = {
            "id": row["id"],
            "name": row["name"],
            "category": row["category"],
            "price": row["price"],
            "description": row["description"],
            "stock": row["stock"],
            "image_url": row["image_url"],
        }
        quantity = row["quantity"]
        subtotal = product["price"] * quantity
        total += subtotal
        items_count += quantity
        items.append({"product": product, "quantity": quantity, "subtotal": subtotal})

    return {"items": items, "total": total, "items_count": items_count}


def checkout_cart():
    cart = get_cart()

    if cart["items_count"] == 0:
        return None, "EMPTY_CART"

    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO orders (total, items_count) VALUES (?, ?)",
            (cart["total"], cart["items_count"]),
        )
        order_id = cursor.lastrowid

        for item in cart["items"]:
            product = item["product"]
            conn.execute(
                """
                INSERT INTO order_items
                    (order_id, product_id, product_name, unit_price, quantity, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    order_id,
                    product["id"],
                    product["name"],
                    product["price"],
                    item["quantity"],
                    item["subtotal"],
                ),
            )

        conn.execute("DELETE FROM cart_items")
        conn.commit()

    return {
        "id": order_id,
        "total": cart["total"],
        "items_count": cart["items_count"],
        "items": cart["items"],
        "message": "Compra confirmada correctamente",
    }, None
