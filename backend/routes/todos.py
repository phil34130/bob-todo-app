from flask import Blueprint, jsonify, request

from backend.extensions import db
from backend.models.todo import Todo

todos_bp = Blueprint("todos", __name__)

VALID_PRIORITIES = {"low", "medium", "high"}


# ------------------------------------------------------------------ #
# GET /api/todos                                                       #
# ------------------------------------------------------------------ #
@todos_bp.get("/todos")
def list_todos():
    status = request.args.get("status")
    query = Todo.query
    if status == "done":
        query = query.filter_by(done=True)
    elif status == "open":
        query = query.filter_by(done=False)
    elif status is not None:
        return jsonify({"error": "status must be 'open' or 'done'"}), 400
    todos = query.order_by(Todo.created_at.desc()).all()
    return jsonify([t.to_dict() for t in todos]), 200


# ------------------------------------------------------------------ #
# POST /api/todos                                                      #
# ------------------------------------------------------------------ #
@todos_bp.post("/todos")
def create_todo():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": f"priority must be one of {sorted(VALID_PRIORITIES)}"}), 400

    todo = Todo(title=title, priority=priority)
    db.session.add(todo)
    db.session.commit()
    return jsonify(todo.to_dict()), 201


# ------------------------------------------------------------------ #
# GET /api/todos/<id>                                                  #
# ------------------------------------------------------------------ #
@todos_bp.get("/todos/<int:todo_id>")
def get_todo(todo_id):
    todo = db.session.get(Todo, todo_id)
    if todo is None:
        return jsonify({"error": "Todo not found"}), 404
    return jsonify(todo.to_dict()), 200


# ------------------------------------------------------------------ #
# PUT /api/todos/<id>                                                  #
# ------------------------------------------------------------------ #
@todos_bp.put("/todos/<int:todo_id>")
def update_todo(todo_id):
    todo = db.session.get(Todo, todo_id)
    if todo is None:
        return jsonify({"error": "Todo not found"}), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": f"priority must be one of {sorted(VALID_PRIORITIES)}"}), 400

    done = data.get("done", False)
    if not isinstance(done, bool):
        return jsonify({"error": "done must be a boolean"}), 400

    todo.title = title
    todo.priority = priority
    todo.done = done
    db.session.commit()
    return jsonify(todo.to_dict()), 200


# ------------------------------------------------------------------ #
# DELETE /api/todos/<id>                                               #
# ------------------------------------------------------------------ #
@todos_bp.delete("/todos/<int:todo_id>")
def delete_todo(todo_id):
    todo = db.session.get(Todo, todo_id)
    if todo is None:
        return jsonify({"error": "Todo not found"}), 404
    db.session.delete(todo)
    db.session.commit()
    return "", 204


# ------------------------------------------------------------------ #
# PATCH /api/todos/<id>/toggle                                         #
# ------------------------------------------------------------------ #
@todos_bp.patch("/todos/<int:todo_id>/toggle")
def toggle_todo(todo_id):
    todo = db.session.get(Todo, todo_id)
    if todo is None:
        return jsonify({"error": "Todo not found"}), 404
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict()), 200
