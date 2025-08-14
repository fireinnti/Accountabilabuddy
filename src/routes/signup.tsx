import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react'
import { login } from '../auth'
import { dataApi, isRealApi } from '../dataApi'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username required')
      return
    }
    if (!password.trim()) {
      setError('Password required')
      return
    }
    try {
      let user
      if (isRealApi) {
        // Call backend API to create user
        await dataApi.createUser({ username: username.trim(), password: password.trim() })
        // Log in with backend
        user = await dataApi.loginUser({ username: username.trim(), password: password.trim() })
      } else {
        // Fake API: just use username
        await dataApi.createUser({ username: username.trim(), password: password.trim() })
        user = await dataApi.loginUser({ username: username.trim(), password: password.trim() })
      }
      // @ts-expect-error
      login(user.username)
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form onSubmit={handleSignup} className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Create a username"
          value={username}
          onChange={e => { setUsername(e.target.value); setError('') }}
        />
        <input
          className="w-full rounded border px-3 py-2"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="w-full rounded bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700">
          Create Account
        </button>
      </form>
    </div>
  )
}
