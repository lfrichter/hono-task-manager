import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { db, todoQueries } from './db';
import app from './index';

// Helper to clear the database before and after each test to ensure isolation
const clearDb = () => db.run('DELETE FROM todos');
beforeEach(clearDb);
afterEach(clearDb);

// Test suite for the Todo API
describe('Todo API', () => {
  test('GET /todos - should return an empty array initially', async () => {
    const res = await app.request('/todos');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  test('POST /todos - should create a new todo', async () => {
    const req = new Request('http://localhost/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Learn Hono' }),
    });

    const res = await app.request(req);
    expect(res.status).toBe(201);
    const newTodo = await res.json();
    expect(newTodo.text).toBe('Learn Hono');
    expect(newTodo.done).toBe(false);
  });

  test('POST /todos - should return 400 for empty text', async () => {
    const req = new Request('http://localhost/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });

    const res = await app.request(req);
    expect(res.status).toBe(400);
  });

  test('GET /todos/:id - should return a single todo', async () => {
    // First, create a todo to fetch
    const { lastInsertRowid: id } = todoQueries.insert('Test Get by ID', false);

    const res = await app.request(`/todos/${id}`);
    expect(res.status).toBe(200);
    const todo = await res.json();
    expect(todo.id).toBe(Number(id));
    expect(todo.text).toBe('Test Get by ID');
  });

  test('GET /todos/:id - should return 404 for non-existent todo', async () => {
    const res = await app.request('/todos/999');
    expect(res.status).toBe(404);
  });

  test('PUT /todos/:id - should update a todo', async () => {
    // First, create a todo to update
    const { lastInsertRowid: id } = todoQueries.insert('Initial Text', false);

    const req = new Request(`http://localhost/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Updated Text', done: true }),
    });

    const res = await app.request(req);
    expect(res.status).toBe(200);
    const updatedTodo = await res.json();
    expect(updatedTodo.text).toBe('Updated Text');
    expect(updatedTodo.done).toBe(true);

    // Verify in DB
    const dbTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(Number(id));
    expect(dbTodo.text).toBe('Updated Text');
    expect(dbTodo.done).toBe(1); // SQLite uses 1 for true
  });

  test('PUT /todos/:id - should return 404 for non-existent todo', async () => {
    const req = new Request('http://localhost/todos/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Does not matter' }),
    });
    const res = await app.request(req);
    expect(res.status).toBe(404);
  });

  test('DELETE /todos/:id - should delete a todo', async () => {
    // First, create a todo to delete
    const { lastInsertRowid: id } = todoQueries.insert('To be deleted', false);

    const req = new Request(`http://localhost/todos/${id}`, {
      method: 'DELETE',
    });

    const res = await app.request(req);
    expect(res.status).toBe(204);

    // Verify it's gone
    const getRes = await app.request(`/todos/${id}`);
    expect(getRes.status).toBe(404);
  });

  test('DELETE /todos/:id - should return 404 for non-existent todo', async () => {
    const req = new Request('http://localhost/todos/999', {
      method: 'DELETE',
    });
    const res = await app.request(req);
    expect(res.status).toBe(404);
  });
});
