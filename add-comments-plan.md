# Plan: Add Beginner-Friendly Comments to app.js

## Overview

Add detailed inline comments to `frontend/js/app.js` covering:
- How API calls are made (and where they come from)
- Why `async/await` is used instead of raw Promises
- How errors are caught and surfaced to the user
- The purpose of each function

`api.js` contains the actual `fetch` wrappers (`fetchTodos`, `createTodo`, `toggleTodo`, `deleteTodo`).
`app.js` uses those functions to drive the DOM. Comments should explain the *relationship* between
the two files as well as each function's role in `app.js`.

---

## Sub-Tasks

### 1 — Add file-level header comment
**Intent:** Orient a beginner immediately — explain what `app.js` does, how it relates to `api.js`,
and what `async/await` is at a high level.

**Expected Outcomes:** A multi-line block comment at the top of `app.js` summarising the file's role.

**Todo List:**
- [ ] Add a JSDoc-style block comment at line 1 explaining: the file's purpose, that API calls
      live in `api.js`, and a one-sentence intro to `async/await`.

**Relevant Context:** [`frontend/js/app.js`](bob-demo/todo-app/frontend/js/app.js), [`frontend/js/api.js`](bob-demo/todo-app/frontend/js/api.js)

**Status:** `[ ] pending`

---

### 2 — Comment DOM reference declarations (lines 1–4)
**Intent:** Explain why the four DOM elements are cached in variables at the top of the file.

**Expected Outcomes:** Each `document.getElementById` line has a short inline comment.

**Todo List:**
- [ ] Add a brief comment above or beside each of the four `getElementById` calls.

**Relevant Context:** [`app.js` lines 1–4](bob-demo/todo-app/frontend/js/app.js:1)

**Status:** `[ ] pending`

---

### 3 — Comment `loadTodos` (lines 6–14)
**Intent:** Explain the async call to `fetchTodos`, why `await` is needed, and what the `catch`
block does when the network request fails.

**Expected Outcomes:** Inline comments inside `loadTodos` covering the `await`, the `renderTodos`
call, and the error fallback that replaces the list with an error message.

**Todo List:**
- [ ] Comment the `await fetchTodos()` call — explain it suspends execution until the API responds.
- [ ] Comment `renderTodos(todos)` — explain it hands the data off to the rendering layer.
- [ ] Comment the `catch` block — explain when it fires and why the list is updated with an error message.

**Relevant Context:** [`app.js` lines 6–14](bob-demo/todo-app/frontend/js/app.js:6)

**Status:** `[ ] pending`

---

### 4 — Comment `renderTodos` (lines 16–25)
**Intent:** Explain the full re-render strategy (clear then rebuild) and the empty-state placeholder.

**Expected Outcomes:** Inline comments explaining why `innerHTML = ''` is used, the empty-state
branch, and the loop that delegates to `createTodoElement`.

**Todo List:**
- [ ] Comment the `innerHTML = ''` clear — explain why re-rendering from scratch is simpler than diffing.
- [ ] Comment the empty-state branch.
- [ ] Comment the `for…of` loop and `appendChild` call.

**Relevant Context:** [`app.js` lines 16–25](bob-demo/todo-app/frontend/js/app.js:16)

**Status:** `[ ] pending`

---

### 5 — Comment `createTodoElement` (lines 27–53)
**Intent:** Walk through the DOM construction step by step — element creation, class/data attribute
assignment, event listener attachment, and final assembly.

**Expected Outcomes:** A comment above the function explaining its return value, plus inline
comments for each logical block (checkbox, title span, priority badge, delete button, `append`).

**Todo List:**
- [ ] Add a JSDoc comment above the function (`@param`, `@returns`).
- [ ] Comment the `li` setup — class toggling based on `todo.done`, `dataset.id` for later querying.
- [ ] Comment the checkbox block — how `checked` mirrors state and why the `change` listener calls `handleToggle`.
- [ ] Comment the title and badge spans briefly.
- [ ] Comment the delete button and its `click` listener.
- [ ] Comment the final `li.append(...)` call.

**Relevant Context:** [`app.js` lines 27–53](bob-demo/todo-app/frontend/js/app.js:27)

**Status:** `[ ] pending`

---

### 6 — Comment `handleToggle` (lines 55–68)
**Intent:** Explain the optimistic-then-correct update pattern: the DOM is updated immediately
from the server response, and a full reload is used as fallback on error.

**Expected Outcomes:** Inline comments on the `await toggleTodo(id)` call, the DOM query using
`data-id`, the class/checkbox update, and the error recovery strategy.

**Todo List:**
- [ ] Comment `await toggleTodo(id)` — what it sends and what it returns.
- [ ] Comment the DOM query — why `dataset` is used to find the right `<li>`.
- [ ] Comment the class and checkbox update — explain the conditional class string.
- [ ] Comment the `catch` block — why `loadTodos()` is called on failure (sync DOM back to server truth).

**Relevant Context:** [`app.js` lines 55–68](bob-demo/todo-app/frontend/js/app.js:55)

**Status:** `[ ] pending`

---

### 7 — Comment `handleDelete` (lines 70–82)
**Intent:** Explain the delete-then-remove pattern and the empty-state re-check after removal.

**Expected Outcomes:** Inline comments on the `await` call, the DOM removal, the post-delete
empty-state check, and the `catch` block.

**Todo List:**
- [ ] Comment `await deleteTodo(id)` — explain it waits for server confirmation before touching the DOM.
- [ ] Comment the conditional `li.remove()`.
- [ ] Comment the `children.length === 0` check — why the placeholder is injected here too.
- [ ] Comment the `catch` block.

**Relevant Context:** [`app.js` lines 70–82](bob-demo/todo-app/frontend/js/app.js:70)

**Status:** `[ ] pending`

---

### 8 — Comment the form submit handler (lines 84–101)
**Intent:** Explain `e.preventDefault()`, input validation, the `await createTodo` call, placeholder
removal, and input reset.

**Expected Outcomes:** Inline comments covering each logical step of the submit handler.

**Todo List:**
- [ ] Comment `e.preventDefault()` — explain it stops the default page reload.
- [ ] Comment `title.trim()` and the early-return guard.
- [ ] Comment `await createTodo(title, priority)` — what it sends and returns.
- [ ] Comment the placeholder removal before appending the new item.
- [ ] Comment `titleInput.value = ''` and `titleInput.focus()` — explain UX intent.
- [ ] Comment the `catch` block.

**Relevant Context:** [`app.js` lines 84–101](bob-demo/todo-app/frontend/js/app.js:84)

**Status:** `[ ] pending`

---

### 9 — Comment the `loadTodos()` bootstrap call (line 103)
**Intent:** Explain why `loadTodos()` is called at the bottom of the file (initial page load).

**Expected Outcomes:** A single-line comment above `loadTodos()` on line 103.

**Todo List:**
- [ ] Add comment: "Kick off the initial load when the script is first parsed."

**Relevant Context:** [`app.js` line 103](bob-demo/todo-app/frontend/js/app.js:103)

**Status:** `[ ] pending`
