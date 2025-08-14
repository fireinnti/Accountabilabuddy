import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import db, { createTodo, createUser, deleteTodo, getPublicTodosFromFriends, getTodosForUser, getUserByCredentials, getUserById, getUserByUsername, updateTodo } from './turso.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 44000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from Express API!')
})

app.get('/dbinfo', async (req, res) => {
  try {
    const result = await db.execute('SELECT sqlite_version() AS version')
    res.json({ sqlite_version: result.rows[0].version })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/users', async (req, res) => {
  const { username, password } = req.body
  console.log('[POST /api/users] Request body:', req.body)
  if (!username || !password) {
    console.log('[POST /api/users] Missing fields')
    return res.status(400).json({ error: 'Missing fields' })
  }
  try {
    const id = uuidv4()
    await createUser({ id, username, password })
    console.log('[POST /api/users] User created:', { id, username })
    res.json({ id, username })
  } catch (err) {
    console.error('[POST /api/users] Error:', err)
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Username already exists' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body
  console.log('[POST /api/login] Request body:', req.body)
  if (!username || !password) {
    console.log('[POST /api/login] Missing fields')
    return res.status(400).json({ error: 'Missing fields' })
  }
  try {
    const user = await getUserByCredentials(username, password)
    if (!user) {
      console.log('[POST /api/login] Invalid credentials for:', username)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    console.log('[POST /api/login] Login success:', user)
    res.json(user)
  } catch (err) {
    console.error('[POST /api/login] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/todos/:user_id', async (req, res) => {
  console.log('[GET /api/todos/:user_id] Params:', req.params)
  try {
    const todos = await getTodosForUser(req.params.user_id)
    console.log('[GET /api/todos/:user_id] Todos:', todos)
    res.json(todos)
  } catch (err) {
    console.error('[GET /api/todos/:user_id] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/todos', async (req, res) => {
  console.log('[POST /api/todos] Body:', req.body)
  const { user_id, title, description, state, visibility } = req.body
  if (!user_id || !title || !state || !visibility) {
    console.log('[POST /api/todos] Missing fields:', { user_id, title, state, visibility })
    return res.status(400).json({ error: 'Missing fields' })
  }
  try {
    const id = uuidv4()
    console.log('[POST /api/todos] Creating todo:', { id, user_id, title, description, state, visibility })
    await createTodo({ id, user_id, title, description, state, visibility })
    console.log('[POST /api/todos] Todo created:', { id, user_id, title, description, state, visibility })
    res.json({ id, user_id, title, description, state, visibility })
  } catch (err) {
    console.error('[POST /api/todos] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.patch('/api/todos/:id', async (req, res) => {
  console.log('[PATCH /api/todos/:id] Params:', req.params, 'Body:', req.body)
  try {
    await updateTodo({ id: req.params.id, patch: req.body })
    console.log('[PATCH /api/todos/:id] Todo updated:', { id: req.params.id, ...req.body })
    res.json({ id: req.params.id, ...req.body })
  } catch (err) {
    console.error('[PATCH /api/todos/:id] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/todos/:id', async (req, res) => {
  console.log('[DELETE /api/todos/:id] Params:', req.params)
  try {
    await deleteTodo(req.params.id)
    console.log('[DELETE /api/todos/:id] Todo deleted:', req.params.id)
    res.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/todos/:id] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/friends/:user_id/todos', async (req, res) => {
  const user_id = req.params.user_id
  console.log('[GET /api/friends/:user_id/todos] user_id:', user_id)
  try {
    // Get public todos from friends
    const todos = await getPublicTodosFromFriends(user_id)
    console.log('[GET /api/friends/:user_id/todos] Fetched todos:', todos)
    // Get usernames for each friend
    const friendIds = [...new Set(todos.map(t => t.user_id))]
    console.log('[GET /api/friends/:user_id/todos] Friend IDs:', friendIds)
    const idToUsername = {}
    for (const fid of friendIds) {
      const user = await getUserById(fid)
      idToUsername[fid] = user ? user.username : fid
      console.log(`[GET /api/friends/:user_id/todos] Username for ${fid}:`, idToUsername[fid])
    }
    // Attach username to each todo
    const todosWithUsername = todos.map(t => ({ ...t, username: idToUsername[t.user_id] }))
    console.log('[GET /api/friends/:user_id/todos] Todos with username:', todosWithUsername)
    res.json(todosWithUsername)
  } catch (err) {
    console.error('[GET /api/friends/:user_id/todos] Error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/friends', async (req, res) => {
  const { user_id, friend_username } = req.body
  console.log('[POST /api/friends] Body:', req.body)
  if (!user_id || !friend_username) {
    console.log('[POST /api/friends] Missing user_id or friend_username')
    return res.status(400).json({ error: 'Missing user_id or friend_username' })
  }
  try {
    // Find friend's user id by username
    const friendUser = await getUserByUsername(friend_username)
    console.log('[POST /api/friends] Friend user lookup:', friendUser)
    if (!friendUser) {
      console.log('[POST /api/friends] Friend username not found:', friend_username)
      return res.status(404).json({ error: 'Friend username not found' })
    }
    const selfUser = await getUserByUsername(user_id)
    if (!selfUser) {
      console.log('[POST /api/friends] User not found:', user_id)
      return res.status(404).json({ error: 'User not found' })
    }
    // Add friend relationship
    console.log('[POST /api/friends] Adding friend relationship:', { user_id:selfUser, friend_user_id: friendUser.id })
    await db.execute({
      sql: 'INSERT INTO friends (user_id, friend_user_id, created_at) VALUES (?, ?, ?)',
      args: [selfUser.id, friendUser.id, new Date().toISOString()],
    })
    console.log('[POST /api/friends] Friend relationship added:', { user_id, friend_user_id: friendUser.id })
    res.json({ success: true, friend_user_id: friendUser.id, friend_username })
  } catch (err) {
    console.error('[POST /api/friends] Error:', err)
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Already friends' })
    } else {
      res.status(500).json({ error: err.message })
    }
  }
})

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../dist')))

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
