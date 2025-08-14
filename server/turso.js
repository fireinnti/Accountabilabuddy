import { createClient } from "@libsql/client";
import 'dotenv/config'

// Environment configuration
const TURSO_URL = process.env.TURSO_URL
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

const isDbConfigured = !!TURSO_URL

let db
if (!isDbConfigured) {
  // Fallback to local file DB so container can still run without Turso secrets
  const fallbackUrl = 'file:mydb.sqlite'
  console.warn('[DB] TURSO_URL not set. Falling back to local SQLite file:', fallbackUrl)
  db = createClient({ url: fallbackUrl })
} else {
  db = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN })
  console.log('[DB] Connected using TURSO_URL:', TURSO_URL)
}

export default db
export { isDbConfigured }

// User API
export async function createUser({ id, username, password }) {
  return await db.execute({
    sql: 'INSERT INTO users (id, username, password) VALUES (?, ?, ?)',
    args: [id, username, password],
  })
}

export async function getUserByUsername(username) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username],
  })
  return result.rows[0] || null
}

export async function getUserById(id) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  })
  return result.rows[0] || null
}

export async function getUserByCredentials(username, password) {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ? AND password = ?',
    args: [username, password],
  })
  return result.rows[0] || null
}

// Friends API
export async function addFriend(user_id, friend_id) {
  return await db.execute({
    sql: 'INSERT INTO friends (user_id, friend_id, created_at) VALUES (?, ?, ?)',
    args: [user_id, friend_id, new Date().toISOString()],
  })
}

export async function getFriends(user_id) {
  const result = await db.execute({
    sql: 'SELECT friend_id FROM friends WHERE user_id = ?',
    args: [user_id],
  })
  return result.rows.map(r => r.friend_id)
}

// Todos API
export async function createTodo({ id, user_id, title, description, state, visibility }) {
  const now = new Date().toISOString()
  return await db.execute({
    sql: 'INSERT INTO todos (id, user_id, title, description, state, visibility, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [id, user_id, title, description, state, visibility, now, now],
  })
}

export async function getTodosForUser(user_id) {
  const result = await db.execute({
    sql: 'SELECT * FROM todos WHERE user_id = ?',
    args: [user_id],
  })
  return result.rows
}

export async function getPublicTodosFromFriends(user_id) {
  const friends = await getFriends(user_id)
  if (friends.length === 0) return []
  const placeholders = friends.map(() => '?').join(',')
  const result = await db.execute({
    sql: `SELECT * FROM todos WHERE user_id IN (${placeholders}) AND visibility = 'public'`,
    args: friends,
  })
  return result.rows
}

export async function updateTodo({ id, patch }) {
  const fields = Object.keys(patch)
  const values = Object.values(patch)
  if (fields.length === 0) return
  const setClause = fields.map(f => `${f} = ?`).join(', ')
  return await db.execute({
    sql: `UPDATE todos SET ${setClause}, updated_at = ? WHERE id = ?`,
    args: [...values, new Date().toISOString(), id],
  })
}

export async function deleteTodo(id) {
  return await db.execute({
    sql: 'DELETE FROM todos WHERE id = ?',
    args: [id],
  })
}
