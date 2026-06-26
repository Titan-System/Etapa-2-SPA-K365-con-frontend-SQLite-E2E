from flask import Blueprint, jsonify, request
from app.services.cart_service import add_item, checkout_cart, clear_cart, get_cart, remove_item

cart_bp = Blueprint("cart", __name__, url_prefix="/api/cart")


@cart_bp.get("")
def read_cart():
    return jsonify(get_cart()), 200


@cart_bp.post("/items")
def add_cart_item():
    data = request.get_json(silent=True) or {}

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not isinstance(product_id, int):
        return jsonify({"error": "El campo product_id es obligatorio y debe ser numérico"}), 400

    cart, error = add_item(product_id, quantity)

    if error == "PRODUCT_NOT_FOUND":
        return jsonify({"error": "Producto no encontrado"}), 404

    if error == "INVALID_QUANTITY":
        return jsonify({"error": "La cantidad debe ser un número entero mayor a cero"}), 400

    if error == "INSUFFICIENT_STOCK":
        return jsonify({"error": "Stock insuficiente para agregar esa cantidad"}), 409

    return jsonify(cart), 201


@cart_bp.delete("/items/<int:product_id>")
def delete_cart_item(product_id):
    cart, error = remove_item(product_id)

    if error == "ITEM_NOT_IN_CART":
        return jsonify({"error": "El producto no está en el carrito"}), 404

    return jsonify(cart), 200


@cart_bp.delete("")
def delete_cart():
    clear_cart()
    return jsonify(get_cart()), 200


@cart_bp.get("/total")
def get_cart_total():
    cart = get_cart()
    return jsonify({"total": cart["total"], "items_count": cart["items_count"]}), 200


@cart_bp.post("/checkout")
def checkout():
    order, error = checkout_cart()

    if error == "EMPTY_CART":
        return jsonify({"error": "No se puede finalizar una compra con el carrito vacío"}), 400

    return jsonify({"order": order}), 201
