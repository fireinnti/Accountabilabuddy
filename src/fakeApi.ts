import type { Todo, TodoState } from '@/types'

const KEY = 'accountabilabuddy.todos.v1'

const load = (): Todo[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
const save = (todos: Todo[]) => localStorage.setItem(KEY, JSON.stringify(todos))

const uuid = () =>
  ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  }))

export async function listTodos() { return load() }

export async function createTodo(input: Pick<Todo,'title'|'description'|'visibility'>) {
  const now = new Date().toISOString()
  const todo: Todo = { id: uuid(), title: input.title, description: input.description, state: 'open', createdAt: now, updatedAt: now, visibility: input.visibility }
  const all = load(); all.unshift(todo); save(all); return todo
}

export async function updateTodo(id: string, changes: Partial<Pick<Todo,'title'|'description'|'state'|'visibility'>>) {
  const all = load()
  const i = all.findIndex(t => t.id === id)
  if (i < 0) throw new Error('Not found')
  all[i] = { ...all[i], ...changes, updatedAt: new Date().toISOString() }
  save(all); return all[i]
}

export async function deleteTodo(id: string) {
  save(load().filter(t => t.id !== id))
}

export async function moveTodo(id: string, to: TodoState) {
  return updateTodo(id, { state: to })
}

export async function createUser({ username, password }: { username: string; password: string }) {
  // Just return the user object
  return { username }
}

export async function loginUser({ username, password }: { username: string; password: string }) {
  // Just return the user object
  return { username }
}

export async function addFriend(user_id: string, friend_username: string) {
  // Just return success
  return { success: true, friend_username }
}
