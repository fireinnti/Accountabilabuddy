import type { TodoState } from '@/types'

export const STATES: Array<TodoState> = ['open', 'in_progress', 'blocked', 'closed']

export const STATE_LABELS: Record<TodoState, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  closed: 'Closed',
}
