"""Tests for GET /api/todos and POST /api/todos."""
import json


def test_list_todos_empty(client):
    res = client.get("/api/todos")
    assert res.status_code == 200
    assert res.get_json() == []


def test_create_todo_minimal(client):
    res = client.post("/api/todos", json={"title": "Buy milk"})
    assert res.status_code == 201
    data = res.get_json()
    assert data["title"] == "Buy milk"
    assert data["done"] is False
    assert data["priority"] == "medium"
    assert "id" in data


def test_create_todo_with_priority(client):
    res = client.post("/api/todos", json={"title": "Urgent task", "priority": "high"})
    assert res.status_code == 201
    assert res.get_json()["priority"] == "high"


def test_create_todo_missing_title(client):
    res = client.post("/api/todos", json={"priority": "low"})
    assert res.status_code == 400
    assert "title" in res.get_json()["error"].lower()


def test_create_todo_invalid_priority(client):
    res = client.post("/api/todos", json={"title": "Task", "priority": "urgent"})
    assert res.status_code == 400


def test_create_todo_no_body(client):
    res = client.post("/api/todos", content_type="application/json", data="")
    assert res.status_code == 400


def test_list_todos_returns_created(client):
    client.post("/api/todos", json={"title": "Task A"})
    client.post("/api/todos", json={"title": "Task B"})
    res = client.get("/api/todos")
    assert res.status_code == 200
    titles = [t["title"] for t in res.get_json()]
    assert "Task A" in titles
    assert "Task B" in titles


def test_list_todos_filter_open(client):
    client.post("/api/todos", json={"title": "Open task"})
    res = client.get("/api/todos?status=open")
    assert res.status_code == 200
    assert all(not t["done"] for t in res.get_json())


def test_list_todos_filter_done(client):
    # Create and toggle a todo to done
    created = client.post("/api/todos", json={"title": "Done task"}).get_json()
    client.patch(f"/api/todos/{created['id']}/toggle")
    res = client.get("/api/todos?status=done")
    assert res.status_code == 200
    assert all(t["done"] for t in res.get_json())


def test_list_todos_filter_invalid(client):
    res = client.get("/api/todos?status=invalid")
    assert res.status_code == 400
