import React from 'react'
import type { Todo, TodoState } from '@/types'
import { STATES, STATE_LABELS } from '@/states'

interface TodoBoardProps {
  grouped: Record<TodoState, Array<Todo>>
  onMove: (id: string, to: TodoState) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: Partial<Pick<Todo,'title'|'description'>>) => void
}

export default function TodoBoard({ grouped, onMove, onDelete, onEdit }: TodoBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {STATES.map(state => (
        <Column key={state} title={STATE_LABELS[state]} items={grouped[state]} state={state}
          onMove={onMove} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}

function Column(props: {
  title: string
  items: Array<Todo>
  state: TodoState
  onMove: (id: string, to: TodoState) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: Partial<Pick<Todo,'title'|'description'>>) => void
}) {
  const { title, items, state, onMove, onDelete, onEdit } = props
  const targets = (['open','in_progress','blocked','closed'] as Array<TodoState>).filter(s => s !== state)

  return (
    <section className="rounded-xl border bg-white p-3 shadow-sm">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </header>
      <ul className="space-y-3">
        {items.length === 0 && <li className="text-sm text-gray-400">No items</li>}
        {items.map(t => (
          <li key={t.id} className="rounded-lg border p-3">
            <InlineEdit
              value={t.title}
              render={(v) => <h4 className="text-sm font-medium">{v || <span className="text-gray-400">Untitled</span>}</h4>}
              onSave={(v) => onEdit(t.id, { title: v })}
            />
            <InlineEdit
              className="mt-1 text-xs text-gray-600"
              value={t.description}
              render={(v) => <p>{v || <span className="text-gray-400">No description</span>}</p>}
              onSave={(v) => onEdit(t.id, { description: v })}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {targets.map(target => (
                <button key={target} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"
                  onClick={() => onMove(t.id, target)}>
                  Move to {target.replace('_', ' ')}
                </button>
              ))}
              <button className="ml-auto rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
                onClick={() => onDelete(t.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function InlineEdit({
  value, onSave, render, className,
}: {
  value: string
  onSave: (v: string) => void
  render: (v: string) => React.ReactNode
  className?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [v, setV] = React.useState(value)
  React.useEffect(() => setV(value), [value])

  if (!editing) {
    return (
      <div className={className}>
        {render(value)}{' '}
        <button className="text-xs text-blue-600" onClick={() => setEditing(true)}>Edit</button>
      </div>
    )
  }

  return (
    <form className={className + ' flex items-center gap-2'} onSubmit={e => { e.preventDefault(); onSave(v.trim()); setEditing(false) }}>
      <input className="w-full rounded border px-2 py-1 text-xs" value={v} onChange={e => setV(e.target.value)} autoFocus />
      <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white">Save</button>
      <button type="button" className="rounded px-2 py-1 text-xs" onClick={() => { setEditing(false); setV(value) }}>Cancel</button>
    </form>
  )
}
