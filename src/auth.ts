// Simple auth state using TanStack Query
import { queryClient } from './tanstack-query-client'

export type User = { id:string, username: string }

// Get current user
export function getUser(): User | null {
  return queryClient.getQueryData(['user']) ?? null
}

// Login
export function login(id: string, username: string) {
  queryClient.setQueryData(['user'], { id, username })
}

// Logout
export function logout() {
  queryClient.setQueryData(['user'], null)
}
