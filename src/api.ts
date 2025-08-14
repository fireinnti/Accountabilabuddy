import type { Todo, TodoState } from '@/types'

const API_URL = '/api'

export async function listTodos(user_id: string): Promise<Array<Todo>> {
  const res = await fetch(`${API_URL}/todos/${user_id}`)
  if (!res.ok) throw new Error('Failed to fetch todos')
  return await res.json()
}

export async function createTodo(user_id: string, input: { title: string; description: string; state: TodoState; visibility: 'private' | 'public' }): Promise<Todo> {
  const res = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, ...input }),
  })
  if (!res.ok) throw new Error('Failed to create todo')
  return await res.json()
}

export async function updateTodo(id: string, patch: Partial<{ title?: string; description?: string; state?: TodoState; visibility?: 'private' | 'public' }>): Promise<Todo> {
  const res = await fetch(`${API_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Failed to update todo')
  return await res.json()
}

export async function deleteTodo(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete todo')
}

export async function moveTodo(id: string, to: TodoState): Promise<Todo> {
  return updateTodo(id, { state: to })
}

export async function createUser({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return await res.json()
}

export async function loginUser({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Invalid credentials')
  return await res.json()
}

export async function addFriend(user_id: string, friend_username: string) {
  const res = await fetch(`${API_URL}/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, friend_username }),
  })
  if (!res.ok) throw new Error('Failed to add friend')
  return await res.json()
}
