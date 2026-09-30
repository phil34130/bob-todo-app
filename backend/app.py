import os

from flask import Flask, send_from_directory

from backend.extensions import db, migrate, cors
from config import config

# Resolve the frontend directory relative to this file
_FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


def create_app(env: str | None = None) -> Flask:
    """Application factory.

    Args:
        env: Configuration key — one of ``development``, ``testing``,
             ``production``, or ``None`` (falls back to ``FLASK_ENV``
             environment variable, defaulting to ``development``).
    """
    if env is None:
        env = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config.get(env, config["default"]))

    # ------------------------------------------------------------------ #
    # Extensions                                                           #
    # ------------------------------------------------------------------ #
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # ------------------------------------------------------------------ #
    # Models — imported here so Flask-Migrate can detect them              #
    # ------------------------------------------------------------------ #
    with app.app_context():
        from backend.models import todo  # noqa: F401

    # ------------------------------------------------------------------ #
    # Blueprints                                                           #
    # ------------------------------------------------------------------ #
    from backend.routes.todos import todos_bp  # noqa: E402

    app.register_blueprint(todos_bp, url_prefix="/api")

    # ------------------------------------------------------------------ #
    # Frontend static files                                                #
    # ------------------------------------------------------------------ #
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        if path and os.path.exists(os.path.join(_FRONTEND_DIR, path)):
            return send_from_directory(_FRONTEND_DIR, path)
        return send_from_directory(_FRONTEND_DIR, "index.html")

    return app
