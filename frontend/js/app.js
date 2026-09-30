/**
 * app.js — Todo Application UI Logic
 *
 * This file is responsible for everything the user sees and interacts with:
 * rendering the list, reacting to checkbox toggles, deleting items, and
 * submitting the form to create new todos.
 *
 * All network communication (talking to the Flask backend) is handled in
 * api.js, which exposes four functions used here:
 *   - fetchTodos()         — GET  /api/todos
 *   - createTodo()         — POST /api/todos
 *   - toggleTodo()         — PATCH /api/todos/:id/toggle
 *   - deleteTodo()         — DELETE /api/todos/:id
 *
 * Why async/await?
 * Network requests take an unknown amount of time. Instead of blocking the
 * browser (which would freeze the page), JavaScript uses Promises to say
 * "do this work in the background, then continue". The `async/await` syntax
 * is syntactic sugar on top of Promises that makes async code read like
 * normal top-to-bottom code, which is much easier to follow than chaining
 * .then()/.catch() calls.
 */

// ---------------------------------------------------------------------------
// DOM References
// Cache the elements we interact with so we don't query the DOM repeatedly.
// ---------------------------------------------------------------------------

// The <ul> that holds all todo items.
const todoList = document.getElementById('todo-list');

// The <form> used to submit new todos.
const todoForm = document.getElementById('todo-form');

// The text <input> where the user types the todo title.
const titleInput = document.getElementById('todo-title');

// The <select> dropdown for choosing a priority (low / medium / high).
const prioritySelect = document.getElementById('todo-priority');

// ---------------------------------------------------------------------------
// loadTodos — fetch all todos from the server and render them
// ---------------------------------------------------------------------------

/**
 * Fetches the current list of todos from the API and renders them.
 * Called once on page load and as a fallback after certain errors.
 */
async function loadTodos() {
  try {
    // `await` pauses execution here until fetchTodos() resolves with data.
    // Under the hood, fetchTodos() calls fetch() which returns a Promise.
    // `await` unwraps that Promise so `todos` is the plain array we need.
    const todos = await fetchTodos();

    // Hand the data off to the rendering layer to build the DOM.
    renderTodos(todos);
  } catch (err) {
    // If the network request failed (e.g. server is down), fetchTodos()
    // throws an Error. We log it for debugging and show a message in the
    // list so the user knows something went wrong.
    console.error(err);
    todoList.innerHTML = '<li style="color:#991b1b">Failed to load todos.</li>';
  }
}

// ---------------------------------------------------------------------------
// renderTodos — clear the list and rebuild it from an array of todo objects
// ---------------------------------------------------------------------------

/**
 * Replaces the entire todo list in the DOM with a fresh render.
 * Re-rendering from scratch is simpler than trying to diff the existing
 * DOM against new data — there are only ever a handful of todos, so the
 * performance cost is negligible.
 *
 * @param {Array} todos - Array of todo objects from the API.
 */
function renderTodos(todos) {
  // Wipe the current list contents before rebuilding.
  todoList.innerHTML = '';

  // If there are no todos, show a friendly placeholder and stop.
  if (todos.length === 0) {
    todoList.innerHTML = '<li style="color:#57606a;padding:8px 0">No todos yet — add one above!</li>';
    return;
  }

  // Build a DOM element for each todo and append it to the list.
  for (const todo of todos) {
    todoList.appendChild(createTodoElement(todo));
  }
}

// ---------------------------------------------------------------------------
// createTodoElement — build a single <li> element for one todo
// ---------------------------------------------------------------------------

/**
 * Constructs and returns a fully interactive <li> element for a todo.
 * This function creates each piece of the row (checkbox, title, badge,
 * delete button), wires up event listeners, and assembles them together.
 *
 * @param {Object} todo - A todo object with id, title, priority, and done.
 * @returns {HTMLLIElement} The fully constructed list item element.
 */
function createTodoElement(todo) {
  // Create the wrapper <li>. Add the "done" class when the todo is complete
  // so CSS can strike through the title. Store the todo's id in a data
  // attribute so we can look this element up later by id.
  const li = document.createElement('li');
  li.className = `todo-item${todo.done ? ' done' : ''}`;
  li.dataset.id = todo.id;

  // Checkbox — reflects the current done/not-done state.
  // When the user changes it, handleToggle is called to update the server.
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.done;   // pre-tick the box if already done
  checkbox.addEventListener('change', () => handleToggle(todo.id));

  // Title span — plain text display of the todo's title.
  const title = document.createElement('span');
  title.className = 'todo-title';
  title.textContent = todo.title;

  // Priority badge — a colour-coded pill showing low / medium / high.
  // The CSS class (e.g. badge-high) controls the colour.
  const badge = document.createElement('span');
  badge.className = `badge badge-${todo.priority}`;
  badge.textContent = todo.priority;

  // Delete button — calls handleDelete when clicked to remove this todo.
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-delete';
  deleteBtn.title = 'Delete';
  deleteBtn.textContent = '✕';
  deleteBtn.addEventListener('click', () => handleDelete(todo.id));

  // Assemble all child elements into the <li> in display order.
  li.append(checkbox, title, badge, deleteBtn);
  return li;
}

// ---------------------------------------------------------------------------
// handleToggle — flip a todo's done state via the API, then update the DOM
// ---------------------------------------------------------------------------

/**
 * Sends a PATCH request to toggle the done state of a todo, then updates
 * that item's appearance in the list using the value returned by the server.
 *
 * @param {number} id - The id of the todo to toggle.
 */
async function handleToggle(id) {
  try {
    // Ask the server to flip the done flag and return the updated todo object.
    // We use the server's response (not our local assumption) to update the
    // DOM, so the UI always reflects the true state stored in the database.
    const updated = await toggleTodo(id);

    // Find the <li> for this todo using the data-id attribute we set earlier.
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) {
      // Update the CSS class to add or remove the strikethrough styling.
      li.className = `todo-item${updated.done ? ' done' : ''}`;
      // Sync the checkbox to match the server's confirmed state.
      li.querySelector('input[type="checkbox"]').checked = updated.done;
    }
  } catch (err) {
    // If the toggle failed, log the error and alert the user.
    // Then reload the full list from the server so the checkbox snaps back
    // to its real state — preventing the UI from lying about what's stored.
    console.error(err);
    alert('Could not toggle todo. Please try again.');
    loadTodos();
  }
}

// ---------------------------------------------------------------------------
// handleDelete — delete a todo via the API, then remove it from the DOM
// ---------------------------------------------------------------------------

/**
 * Sends a DELETE request to remove a todo, then removes its <li> from the
 * list. Shows the empty-state placeholder if the list is now empty.
 *
 * @param {number} id - The id of the todo to delete.
 */
async function handleDelete(id) {
  try {
    // Wait for the server to confirm the deletion before touching the DOM.
    // This prevents the item from disappearing if the request fails.
    await deleteTodo(id);

    // Remove the corresponding <li> from the page.
    const li = todoList.querySelector(`[data-id="${id}"]`);
    if (li) li.remove();

    // If the list is now empty, show the placeholder message again.
    if (todoList.children.length === 0) {
      todoList.innerHTML = '<li style="color:#57606a;padding:8px 0">No todos yet — add one above!</li>';
    }
  } catch (err) {
    // If the deletion failed, alert the user. The item stays in the list
    // because we only remove it after a successful server response.
    console.error(err);
    alert('Could not delete todo. Please try again.');
  }
}

// ---------------------------------------------------------------------------
// Form submit handler — create a new todo when the form is submitted
// ---------------------------------------------------------------------------

todoForm.addEventListener('submit', async (e) => {
  // Prevent the browser's default form behaviour, which would reload the page.
  e.preventDefault();

  // Read and sanitise the title. `trim()` removes accidental leading/trailing
  // spaces. If the result is an empty string, do nothing and return early.
  const title = titleInput.value.trim();
  const priority = prioritySelect.value;
  if (!title) return;

  try {
    // Send the new todo to the server. `await` waits until the API responds
    // with the saved todo object (including the id assigned by the database).
    const todo = await createTodo(title, priority);

    // Remove the "no todos" placeholder if present, so it doesn't sit above
    // the first real item.
    const placeholder = todoList.querySelector('li:not(.todo-item)');
    if (placeholder) placeholder.remove();

    // Append a freshly built element for the new todo.
    todoList.appendChild(createTodoElement(todo));

    // Clear the title field and return focus to it so the user can quickly
    // type another todo without clicking.
    titleInput.value = '';
    titleInput.focus();
  } catch (err) {
    console.error(err);
    alert('Could not create todo. Please try again.');
  }
});

// ---------------------------------------------------------------------------
// Bootstrap — kick off the initial data load when the script is first parsed
// ---------------------------------------------------------------------------

// This call runs immediately when the browser executes this script, populating
// the list with any todos already stored on the server.
loadTodos();
