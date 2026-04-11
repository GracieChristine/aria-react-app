import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/');
  }

  const isHost  = user.role === 'host';
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 text-sm text-aria-text-mid hover:text-aria-teal transition-colors"
      >
        <span>Hi, {user.firstName}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-aria-soft-gray rounded-xl shadow-aria-md py-1 z-50">

          {isHost && (
            <Link
              to="/host/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-aria-text-dark hover:bg-aria-offwhite transition-colors"
            >
              Hosting
            </Link>
          )}

          {isAdmin && (
            <>
              {/* TODO: build admin listings management page */}
              <span className="block px-4 py-2 text-sm text-aria-text-light cursor-not-allowed">
                Manage listings
              </span>
              {/* TODO: build admin user management page */}
              <span className="block px-4 py-2 text-sm text-aria-text-light cursor-not-allowed">
                Manage users
              </span>
            </>
          )}

          {/* TODO: build guest bookings/travels page */}
          <span className="block px-4 py-2 text-sm text-aria-text-light cursor-not-allowed">
            Traveling
          </span>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-aria-text-dark hover:bg-aria-offwhite transition-colors"
          >
            Profile
          </Link>

          <div className="border-t border-aria-soft-gray my-1" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-aria-error hover:bg-red-50 transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-white border-b border-aria-soft-gray px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold font-serif italic text-aria-teal tracking-tight">
        aria
      </Link>

      {user ? (
        <UserDropdown user={user} logout={logout} />
      ) : (
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Log in</Link>
          <Link to="/register" className="btn-primary text-sm">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
