import { Link } from '@tanstack/react-router'
import LoginLogout from './LoginLogout'
import { useTheme } from './ThemeProvider'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between items-center">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>
        <div className="px-2">
          <Link to="/signup">Sign Up</Link>
        </div>
      </nav>
      <div className="flex items-center gap-4">
        <button
          className={`rounded px-3 py-1 text-xs ${
            theme === 'dark'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-black'
          }`}
          onClick={() => setTheme(nextTheme)}
        >
          Switch to {nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)} Mode
        </button>
        {window.location.pathname !== '/signup' && <LoginLogout />}
      </div>
    </header>
  )
}
