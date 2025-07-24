// db.ts
import { Database } from 'bun:sqlite';

// Connect to or create the database
export const db = new Database('todos.db');

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0
  )
`);

// Prepare the statements
const getAllStmt = db.prepare('SELECT * FROM todos ORDER BY id');
const insertStmt = db.prepare('INSERT INTO todos (text, done) VALUES ($text, $done)');
const updateStmt = db.prepare('UPDATE todos SET text = $text, done = $done WHERE id = $id');
const deleteStmt = db.prepare('DELETE FROM todos WHERE id = $id');
const findByIdStmt = db.prepare('SELECT * FROM todos WHERE id = $id');

// Helper to map database result to the Todo type, ensuring 'done' is a boolean.
const mapRowToTodo = (row: any): Todo | undefined => {
  if (!row) return undefined;
  return {
    ...row,
    done: Boolean(row.done),
  };
};

export const todoQueries = {
  getAll: () => (getAllStmt.all() as any[]).map(row => mapRowToTodo(row)!),
  insert: (text: string, done: boolean) =>
    insertStmt.run({ $text: text, $done: done }),
  update: (id: number, text: string, done: boolean) =>
    updateStmt.run({ $text: text, $done: done, $id: id }),
  delete: (id: number) => deleteStmt.run({ $id: id }),
  findById: (id: number) => mapRowToTodo(findByIdStmt.get({ $id: id })),
};

// Types
export type Todo = {
  id: number;
  text: string;
  done: boolean;
};
