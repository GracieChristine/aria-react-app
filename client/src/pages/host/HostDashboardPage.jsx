import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

const STATUS_BADGE = {
  active:   'badge-success',
  inactive: 'badge-warning',
};

function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${colorClass}`}
    >
      {children}
    </button>
  );
}

function ListingCard({ listing, onToggleStatus, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const isActive   = listing.status === 'active';
  const isInactive = listing.status === 'inactive';

  async function handleToggle() {
    setStatusLoading(true);
    await onToggleStatus(listing.id, isActive ? 'inactive' : 'active');
    setStatusLoading(false);
  }

  return (
    <div className="bg-white border border-aria-soft-gray rounded-2xl shadow-aria-sm overflow-hidden">
      <div className="px-6 py-5 flex items-start justify-between gap-4">

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-serif italic text-aria-text-dark text-[1.05rem] truncate">{listing.title}</h2>
            <span className={`badge ${STATUS_BADGE[listing.status] ?? 'badge-warning'} shrink-0`}>
              {listing.status === 'active' ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-aria-text-mid mt-0.5">
            {listing.propertyType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} · {listing.city}, {listing.world}
          </p>
          <p className="text-xs text-aria-text-mid mt-0.5">
            {listing.bedrooms} bd · {listing.bathrooms} ba · {listing.maxGuests} guests · <span className="font-semibold">{listing.pricePerNight} gold/night</span>
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {/* Edit */}
          <IconBtn
            title="Edit"
            colorClass="text-aria-text-light hover:bg-aria-soft-gray hover:text-aria-text-dark"
          >
            <Link to={`/host/listings/${listing.id}/edit`} className="flex items-center justify-center w-full h-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Link>
          </IconBtn>

          {/* Map pin toggle */}
          {(isActive || isInactive) && (
            <IconBtn
              title={isActive ? 'Go Offline' : 'Go Online'}
              onClick={handleToggle}
              disabled={statusLoading}
              colorClass={isActive
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-amber-600 hover:bg-amber-50'}
            >
              {isActive ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </IconBtn>
          )}

          {/* Delete */}
          <IconBtn
            title="Delete"
            onClick={() => setConfirmDelete(true)}
            colorClass="text-aria-text-light hover:bg-red-50 hover:text-aria-error"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </IconBtn>
        </div>
      </div>

      {confirmDelete && (
        <div className="px-6 py-3 border-t border-aria-offwhite flex items-center justify-end gap-2">
          <span className="text-xs text-aria-error font-medium">Delete this listing?</span>
          <button
            className="btn btn-danger text-xs py-1 px-3"
            onClick={() => { setConfirmDelete(false); onDelete(listing.id); }}
          >
            Yes, delete
          </button>
          <button
            className="btn btn-ghost text-xs py-1 px-3"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function HostDashboardPage() {
  const { user, token, authReady } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/listings/host/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? 'Failed to load listings.'); return; }
      setListings(data.listings ?? []);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authReady && user) fetchListings();
  }, [fetchListings, authReady, user]);

  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'host' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  async function handleToggleStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/listings/${id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (res.ok) await fetchListings();
    } catch {
      // silently ignore — UI stays unchanged
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setListings(prev => prev.filter(l => l.id !== id));
    } catch {
      // silently ignore
    }
  }

  const active   = listings.filter(l => l.status === 'active');
  const inactive = listings.filter(l => l.status === 'inactive');
  const ordered  = [...active, ...inactive];

  return (
    <div className="min-h-screen bg-aria-offwhite">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif italic font-normal text-3xl text-aria-text-dark">
            Your listings
          </h1>
          <button
            className="btn btn-primary text-sm"
            onClick={() => navigate('/host/listings/new')}
          >
            + Add listing
          </button>
        </div>

        {loading && (
          <p className="text-sm text-aria-text-light">Loading your listings…</p>
        )}

        {error && (
          <p className="text-sm text-aria-error">{error}</p>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="bg-white border border-aria-soft-gray rounded-2xl shadow-aria-sm px-8 py-12 text-center">
            <p className="font-serif italic text-aria-text-dark text-xl mb-2">No listings yet</p>
            <p className="text-sm text-aria-text-mid mb-6">Create your first listing to start hosting.</p>
            <button
              className="btn btn-primary text-sm"
              onClick={() => navigate('/host/listings/new')}
            >
              Create a listing
            </button>
          </div>
        )}

        {!loading && !error && ordered.length > 0 && (
          <div className="flex flex-col gap-4">
            {ordered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
