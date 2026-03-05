import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-aria-soft-gray px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold font-serif italic text-aria-teal tracking-tight">
        aria
      </Link>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost text-sm">
          Log in
        </Link>
        <Link to="/register" className="btn-primary text-sm">
          Sign up
        </Link>
      </div>
    </nav>
  )
}
