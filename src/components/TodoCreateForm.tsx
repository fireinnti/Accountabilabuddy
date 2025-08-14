import React from 'react'
import type { Todo, TodoState } from '@/types'

interface TodoCreateFormProps {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  visibility: 'private' | 'public'
  setVisibility: (v: 'private' | 'public') => void
  onCreate: (e: React.FormEvent) => void
}

export default function TodoCreateForm({
  title, setTitle, description, setDescription, visibility, setVisibility, onCreate
}: TodoCreateFormProps) {
  return (
    <form onSubmit={onCreate} className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Create a new item</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" placeholder="Title"
          value={title} onChange={e => setTitle(e.target.value)} />
        <input className="w-full rounded-lg border px-3 py-2 outline-none focus:ring sm:col-span-2" placeholder="Description"
          value={description} onChange={e => setDescription(e.target.value)} />
        <select className="w-full rounded-lg border px-3 py-2 outline-none focus:ring" value={visibility} onChange={e => setVisibility(e.target.value as 'private'|'public')}>
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>
      </div>
      <div className="mt-3">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Add</button>
      </div>
    </form>
  )
}
