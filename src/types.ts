export type TodoState = 'open' | 'in_progress' | 'blocked' | 'closed'

export interface Todo {
  id: string
  title: string
  description: string
  state: TodoState
  createdAt: string
  updatedAt: string
  visibility: 'private' | 'public'
}
