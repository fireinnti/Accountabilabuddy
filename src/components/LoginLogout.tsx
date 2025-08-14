import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { login, logout, getUser } from '../auth'
import { dataApi } from '../dataApi'

export default function LoginLogout() {
  const [user, setUser] = useState(getUser())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [friendUsername, setFriendUsername] = useState('')
  const [error, setError] = useState('')
  const [friendMsg, setFriendMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function refetch() {
      setUser(getUser()) // triggers Board's useEffect to refetch
    }
    window.addEventListener('refetch-friends-todos', refetch)
    return () => window.removeEventListener('refetch-friends-todos', refetch)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const loggedIn = await dataApi.loginUser({ username: username.trim(), password: password.trim() })
      login(loggedIn.id, loggedIn.username)
      setUser(getUser())
      setUsername('')
      setPassword('')
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault()
    setFriendMsg('')
    if (!user || !friendUsername.trim()) return
    try {
      await dataApi.addFriend(user.username, friendUsername.trim())
      setFriendMsg(`Added ${friendUsername.trim()} as a friend!`)
      setFriendUsername('')
      // Refetch friends' todos after adding a friend
      window.dispatchEvent(new Event('refetch-friends-todos'))
    } catch (err: any) {
      setFriendMsg(err.message || 'Failed to add friend')
    }
  }

  if (user) {
    function handleLogout() {
      logout()
      setUser(null)
      navigate({ to: '/' }) 
    }
    return (
      <div className="flex flex-col gap-2 items-end">
        <div className="flex items-center gap-2">
          <span className="text-sm">Hello, <b>{user.username}</b></span>
          <button className="rounded bg-red-600 px-3 py-1 text-xs text-white" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <form className="flex items-center gap-2 mt-1" onSubmit={handleAddFriend}>
          <input
            className="rounded border px-2 py-1 text-xs"
            placeholder="Friend's username"
            value={friendUsername}
            onChange={e => setFriendUsername(e.target.value)}
          />
          <button className="rounded bg-green-600 px-3 py-1 text-xs text-white" type="submit">
            Add Friend
          </button>
        </form>
        {friendMsg && <div className="text-xs text-green-700">{friendMsg}</div>}
      </div>
    )
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleLogin}>
      <input
        className="rounded border px-2 py-1 text-xs"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        className="rounded border px-2 py-1 text-xs"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="rounded bg-blue-600 px-3 py-1 text-xs text-white" type="submit">
        Login
      </button>
      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}
    </form>
  )
}
