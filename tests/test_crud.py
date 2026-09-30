"""Tests for GET, PUT, DELETE /api/todos/<id> and PATCH toggle."""


def _create(client, title="Test todo", priority="medium"):
    return client.post("/api/todos", json={"title": title, "priority": priority}).get_json()


def test_get_todo(client):
    todo = _create(client)
    res = client.get(f"/api/todos/{todo['id']}")
    assert res.status_code == 200
    assert res.get_json()["id"] == todo["id"]


def test_get_todo_not_found(client):
    res = client.get("/api/todos/9999")
    assert res.status_code == 404


def test_update_todo(client):
    todo = _create(client, title="Old title")
    res = client.put(
        f"/api/todos/{todo['id']}",
        json={"title": "New title", "priority": "high", "done": True},
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["title"] == "New title"
    assert data["priority"] == "high"
    assert data["done"] is True


def test_update_todo_not_found(client):
    res = client.put("/api/todos/9999", json={"title": "X", "priority": "low", "done": False})
    assert res.status_code == 404


def test_update_todo_missing_title(client):
    todo = _create(client)
    res = client.put(f"/api/todos/{todo['id']}", json={"priority": "low", "done": False})
    assert res.status_code == 400


def test_update_todo_invalid_priority(client):
    todo = _create(client)
    res = client.put(
        f"/api/todos/{todo['id']}",
        json={"title": "X", "priority": "extreme", "done": False},
    )
    assert res.status_code == 400


def test_delete_todo(client):
    todo = _create(client)
    res = client.delete(f"/api/todos/{todo['id']}")
    assert res.status_code == 204
    # Confirm it's gone
    assert client.get(f"/api/todos/{todo['id']}").status_code == 404


def test_delete_todo_not_found(client):
    res = client.delete("/api/todos/9999")
    assert res.status_code == 404


def test_toggle_todo(client):
    todo = _create(client)
    assert todo["done"] is False

    res = client.patch(f"/api/todos/{todo['id']}/toggle")
    assert res.status_code == 200
    assert res.get_json()["done"] is True

    res = client.patch(f"/api/todos/{todo['id']}/toggle")
    assert res.status_code == 200
    assert res.get_json()["done"] is False


def test_toggle_todo_not_found(client):
    res = client.patch("/api/todos/9999/toggle")
    assert res.status_code == 404
