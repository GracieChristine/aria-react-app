import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="w-full bg-white border-b border-aria-soft-gray px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold font-serif italic text-aria-teal tracking-tight">
        aria
      </Link>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-aria-text-mid">Hi, {user.firstName} {user.lastName}</span>
          <button onClick={logout} className="btn-ghost text-sm">
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Log in</Link>
          <Link to="/register" className="btn-primary text-sm">Sign up</Link>
        </div>
      )}
    </nav>
  )
}
