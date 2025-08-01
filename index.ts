// index.ts
import { Hono } from 'hono';
import { todoQueries } from './db';

const app = new Hono();

// List all todos
app.get('/todos', (c) => {
  try {
    const todos = todoQueries.getAll();
    return c.json(todos);
  } catch (error) {
    console.error('Error listing todos:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get a single todo by ID
app.get('/todos/:id', (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }
    const todo = todoQueries.findById(id);
    if (!todo) return c.json({ error: 'Todo not found' }, 404);
    return c.json(todo);
  } catch (error) {
    console.error(`Error fetching todo ${c.req.param('id')}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create a new todo
app.post('/todos', async (c) => {
  try {
    const { text } = await c.req.json<{ text: string }>();
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return c.json({ error: 'Task text is required and cannot be empty' }, 400);
    }

    const result = todoQueries.insert(text.trim(), false);

    // Get the last inserted ID from the statement execution result
    const id = result.lastInsertRowid;

    // Fetch the newly created todo from the database to ensure consistency
    const newTodo = todoQueries.findById(id);
    if (!newTodo) {
      return c.json({ error: 'Failed to create and retrieve the task' }, 500);
    }

    return c.json(newTodo, 201);
  } catch (error) {
    console.error('Error creating todo:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update a todo
app.put('/todos/:id', async (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }
    const { text, done } = await c.req.json<{ text?: string; done?: boolean }>();

    const existingTodo = todoQueries.findById(id);
    if (!existingTodo) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    const newText = text ?? existingTodo.text;
    const newDone = done ?? existingTodo.done;

    todoQueries.update(id, newText, newDone);

    const updatedTodo = todoQueries.findById(id);
    return c.json(updatedTodo);
  } catch (error) {
    console.error(`Error updating todo ${c.req.param('id')}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete a todo
app.delete('/todos/:id', (c) => {
  try {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid ID' }, 400);
    }
    const todo = todoQueries.findById(id);
    if (!todo) return c.json({ error: 'Todo not found' }, 404);

    todoQueries.delete(id);
    return c.body(null, 204); // 204 No Content
  } catch (error) {
    console.error(`Error deleting todo ${c.req.param('id')}:`, error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check endpoint
app.get('/hello', (c) => c.text('Hello World'))

export default app;
