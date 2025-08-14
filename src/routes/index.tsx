import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useMemo, useState } from 'react'
import type { Todo, TodoState } from '@/types'
import TodoCreateForm from '@/components/TodoCreateForm'
import TodoBoard from '@/components/TodoBoard'
import FriendsTodosBoard from '@/components/FriendsTodosBoard'
import { getUser } from '@/auth'
import { dataApi } from '@/dataApi'

// Extend Todo type for friendsTodos to allow username and user_id
export interface FriendTodo extends Todo {
  user_id?: string;
  username?: string;
}

export const Route = createFileRoute('/')({
  component: Board,
})

function Board() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'private'|'public'>('private')
  const [user, setUser] = useState(getUser())
  const userId = user?.id || ''
  const isLoggedIn = !!userId

  // Local todos state for guests
  const [localTodos, setLocalTodos] = useState<Array<Todo>>(() => {
    const raw = localStorage.getItem('localTodos')
    return raw ? JSON.parse(raw) : []
  })

  // Listen for login/logout changes
  useEffect(() => {
    const unsub = queryClient.getQueryCache().subscribe(() => {
      setUser(getUser())
    })
    return () => unsub()
  }, [queryClient])

  // Save local todos to localStorage
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('localTodos', JSON.stringify(localTodos))
    }
  }, [localTodos, isLoggedIn])

  // Fetch todos
  const { data: todos, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['todos', userId],
    queryFn: () => dataApi.listTodos(userId),
    enabled: isLoggedIn,
    staleTime: 1000 * 60, // cache for 1 minute
    retry: false, // do not retry on error
  })

  // Fetch friends' public todos if logged in
  const [friendsTodos, setFriendsTodos] = useState<Array<FriendTodo>>([])
  useEffect(() => {
    async function fetchFriendsTodos() {
      if (isLoggedIn) {
        try {
          const res = await fetch(`/api/friends/${userId}/todos`)
          if (res.ok) {
            const data = await res.json()
            setFriendsTodos(data)
          } else {
            setFriendsTodos([])
          }
        } catch {
          setFriendsTodos([])
        }
      } else {
        setFriendsTodos([])
      }
    }
    fetchFriendsTodos()
  }, [userId, isLoggedIn])

  useEffect(() => {
    function refetch() {
      setUser(getUser()) // triggers Board's useEffect to refetch
    }
    window.addEventListener('refetch-friends-todos', refetch)
    return () => window.removeEventListener('refetch-friends-todos', refetch)
  }, [])

  // Mutations
  const createMutation = useMutation<Todo, unknown, { title: string; description: string; visibility: 'private'|'public' }>({
    mutationFn: (input) => {
      if (isLoggedIn) {
        // Real API expects (user_id, input)
        return (dataApi as { createTodo: (user_id: string, input: { title: string; description: string; state: TodoState; visibility: 'private' | 'public' }) => Promise<Todo> }).createTodo(userId, { title: input.title, description: input.description, state: 'open', visibility: input.visibility })
      } else {
        // Fake API expects (input)
        return (dataApi as { createTodo: (input: Pick<Todo, 'title' | 'description' | 'visibility'>) => Promise<Todo> }).createTodo({ title: input.title, description: input.description, visibility: input.visibility })
      }
    },
    onSuccess: () => {
      if (isLoggedIn) queryClient.invalidateQueries({ queryKey: ['todos', userId] })
    },
  })

  
  const updateMutation = useMutation<Todo, unknown, { id: string, patch: Partial<Pick<Todo, 'title' | 'description'>> }>({
    mutationFn: (args) => {
      if (isLoggedIn) {
        return dataApi.updateTodo(args.id, args.patch)
      } else {
        let updated: Todo | undefined
        setLocalTodos(prev => prev.map(t => {
          if (t.id === args.id) {
            updated = { ...t, ...args.patch, updatedAt: new Date().toISOString() }
            return updated
          }
          return t
        }))
        // Always return a Todo
        return Promise.resolve(updated as Todo)
      }
    },
    onSuccess: () => {
      if (isLoggedIn) queryClient.invalidateQueries({ queryKey: ['todos', userId] })
    },
  })


  const deleteMutation = useMutation<Todo, unknown, string>({
    mutationFn: (id) => {
      if (isLoggedIn) {
        // Backend returns void, but mutation expects Todo. Return dummy Todo.
        return dataApi.deleteTodo(id).then(() => ({ id, title: '', description: '', state: 'open', createdAt: '', updatedAt: '', visibility: 'private' }))
      } else {
        let deleted: Todo | undefined
        setLocalTodos(prev => {
          const found = prev.find(t => t.id === id)
          if (found) deleted = found
          return prev.filter(t => t.id !== id)
        })
        return Promise.resolve(deleted || { id, title: '', description: '', state: 'open', createdAt: '', updatedAt: '', visibility: 'private' })
      }
    },
    onSuccess: () => {
      if (isLoggedIn) queryClient.invalidateQueries({ queryKey: ['todos', userId] })
    },
  })

  const moveMutation = useMutation<Todo, unknown, { id: string, to: TodoState }>({
    mutationFn: (args) => {
      if (isLoggedIn) {
        return dataApi.moveTodo(args.id, args.to)
      } else {
        let moved: Todo | undefined
        setLocalTodos(prev => prev.map(t => {
          if (t.id === args.id) {
            moved = { ...t, state: args.to, updatedAt: new Date().toISOString() }
            return moved
          }
          return t
        }))
        // Always return a Todo
        return Promise.resolve(moved as Todo)
      }
    },
    onSuccess: () => {
      if (isLoggedIn) queryClient.invalidateQueries({ queryKey: ['todos', userId] })
    },
  })

  // Choose todos source
  const safeTodos = isLoggedIn
    ? (Array.isArray(todos) ? todos : [])
    : localTodos

  const grouped = useMemo(() => {
    const map: Record<TodoState, Array<Todo>> = { open: [], in_progress: [], blocked: [], closed: [] }
    for (const t of safeTodos) map[t.state].push(t)
    return map
  }, [safeTodos])

  if (isLoading || isFetching) return <div className="p-4 text-gray-600">Loading…</div>
  if (isError && (error as any)?.message !== 'Failed to fetch todos') {
    return <div className="p-4 text-red-600">Could not load todos. {String((error as any)?.message || error)}</div>
  }

  function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate(
      { title: title.trim(), description: description.trim(), visibility },
      {
        onSuccess: () => {
          setTitle('')
          setDescription('')
          setVisibility('private')
        },
        onError: (err: any) => {
          alert('Error creating todo: ' + (err?.message || err))
        },
      }
    )
  }

  function onEdit(id: string, patch: Partial<Pick<Todo,'title'|'description'>>) {
    updateMutation.mutate({ id, patch })
  }

  function onDelete(id: string) {
    deleteMutation.mutate(id)
  }

  function onMove(id: string, to: TodoState) {
    moveMutation.mutate({ id, to })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      {!isLoggedIn && (
        <div className="mb-4 rounded bg-yellow-100 p-3 text-yellow-800 text-sm">
          You are not logged in. Your tasks are only saved locally and will not sync across devices. <b>Sign up or log in to save your tasks!</b>
        </div>
      )}
      <TodoCreateForm
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        visibility={visibility}
        setVisibility={setVisibility}
        onCreate={onCreate}
      />
      <TodoBoard grouped={grouped} onMove={onMove} onDelete={onDelete} onEdit={onEdit} />
      {isLoggedIn && friendsTodos.length > 0 && (
        <FriendsTodosBoard friendsTodos={friendsTodos} />
      )}
    </div>
  )
}
