import os
from flask import Flask, jsonify, send_from_directory
from flask_swagger_ui import get_swaggerui_blueprint
from app.db import init_db


def create_app():
    static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
    app = Flask(__name__, static_folder=static_folder, static_url_path="")

    init_db()

    @app.get("/")
    def spa_home():
        return send_from_directory(static_folder, "index.html")

    @app.get("/openapi.yaml")
    def openapi_spec():
        docs_dir = os.path.abspath(os.path.join(app.root_path, "..", "docs"))
        return send_from_directory(docs_dir, "openapi.yaml")

    @app.get("/api")
    def api_home():
        return jsonify({
            "message": "API K365 - Etapa 2",
            "frontend": "/",
            "docs": "/docs",
            "health": "/api/health"
        })

    swagger_ui_blueprint = get_swaggerui_blueprint(
        "/docs",
        "/openapi.yaml",
        config={"app_name": "API K365 - Etapa 2"}
    )
    app.register_blueprint(swagger_ui_blueprint, url_prefix="/docs")

    from app.routes.health import health_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(cart_bp)

    return app
