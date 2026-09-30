const API_BASE = 'http://localhost:5000/api';

async function fetchTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  if (!res.ok) throw new Error(`Failed to fetch todos: ${res.status}`);
  return res.json();
}

async function createTodo(title, priority) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, priority }),
  });
  if (!res.ok) throw new Error(`Failed to create todo: ${res.status}`);
  return res.json();
}

async function toggleTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error(`Failed to toggle todo: ${res.status}`);
  return res.json();
}

async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete todo: ${res.status}`);
}
