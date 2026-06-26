from flask import Blueprint, jsonify
from app.repositories.products_repository import get_all_products, get_product_by_id

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.get("")
def list_products():
    return jsonify({"products": get_all_products()}), 200


@products_bp.get("/<int:product_id>")
def get_product(product_id):
    product = get_product_by_id(product_id)

    if product is None:
        return jsonify({"error": "Producto no encontrado"}), 404

    return jsonify({"product": product}), 200
