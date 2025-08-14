import React, { useState } from 'react'
import { dataApi, isRealApi } from '@/dataApi'
import { queryClient } from '@/tanstack-query-client'
import type { Todo } from '@/types'

export default function ImportTodos({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setImportedCount(null)
    const file = files[0]
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
      setLoading(true)
      try {
        const res = await fetch('/api/import-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        })
        if (!res.ok) throw new Error((await res.json()).error || 'Import failed')
        const body = await res.json()
        const todos: Array<Partial<Todo>> = Array.isArray(body.todos) ? body.todos : []
        let created = 0
        for (const t of todos) {
          const title = (t.title || '').trim() || 'Imported'
          const description = (t.description || '').trim() || ''
          if (isRealApi) {
            // real API expects (user_id, input)
            // @ts-expect-error dynamic import shapes
            await (dataApi as any).createTodo(userId, { title, description, state: 'open', visibility: 'private' })
          } else {
            await (dataApi as any).createTodo({ title, description, visibility: 'private' })
          }
          created++
        }
        // Invalidate todos query so UI refreshes
        queryClient.invalidateQueries({ queryKey: ['todos', userId] })
        setImportedCount(created)
      } catch (err: any) {
        setError(err?.message || String(err))
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => setError('Failed to read the file')
    reader.readAsDataURL(file)
  }

  return (
    <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-semibold">Import from Image</h3>
      <p className="text-sm text-gray-600 mb-2">Upload a photo and we'll extract todos for you.</p>
      <div className="flex items-center gap-2">
        <label className="rounded bg-indigo-600 px-3 py-2 text-xs text-white cursor-pointer">
          {loading ? 'Importing…' : 'Choose Image '}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
            disabled={loading}
          />
        </label>
        {preview && <img src={preview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover' }} className="rounded" />}
        {error && <div className="text-xs text-red-600">{error}</div>}
        {importedCount !== null && <div className="text-xs text-green-700">Imported {importedCount} todos</div>}
      </div>
    </div>
  )
}
