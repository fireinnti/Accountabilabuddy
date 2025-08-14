import React from 'react'
import type { Todo } from '@/types'
import { STATES, STATE_LABELS } from '@/states'

export interface FriendTodo extends Todo {
  user_id?: string;
  username?: string;
}

interface FriendsTodosBoardProps {
  friendsTodos: Array<FriendTodo>
}

export default function FriendsTodosBoard({ friendsTodos }: FriendsTodosBoardProps) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Friends' Public Todos</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {STATES.map(state => (
          <section key={state} className="rounded-xl border bg-gray-50 p-3 shadow-sm">
            <header className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{STATE_LABELS[state]}</h3>
              <span className="text-xs text-gray-500">
                {friendsTodos.filter(t => t.state === state).length}
              </span>
            </header>
            <ul className="space-y-3">
              {friendsTodos.filter(t => t.state === state).length === 0 && (
                <li className="text-sm text-gray-400">No items</li>
              )}
              {friendsTodos.filter(t => t.state === state).map(t => (
                <li key={t.id} className="rounded-lg border p-3">
                  <h4 className="text-sm font-medium">{t.title || <span className="text-gray-400">Untitled</span>}</h4>
                  <p className="mt-1 text-xs text-gray-600">{t.description || <span className="text-gray-400">No description</span>}</p>
                  <div className="mt-2 text-xs text-gray-500">By: {t.username ?? t.user_id ?? 'Unknown'}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
