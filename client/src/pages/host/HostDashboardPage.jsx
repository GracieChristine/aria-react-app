import { useState, useEffect, useCallback } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

const STATUS_BADGE = {
  active:   'badge-success',
  inactive: 'badge-warning',
  draft:    'badge-teal',
  pending:  'badge-blush',
};

function ListingCard({ listing, onToggleStatus, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const isDraft    = listing.status === 'draft';
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
            <span className={`badge ${STATUS_BADGE[listing.status] ?? 'badge-teal'}`}>
              {listing.status}
            </span>
          </div>
          <h2 className="font-serif italic text-aria-text-dark text-[1.05rem] truncate">{listing.title}</h2>
          <p className="text-xs text-aria-text-light mt-0.5">
            {listing.propertyType.replace(/_/g, ' ')} · {listing.city}, {listing.world}
          </p>
          <p className="text-xs text-aria-text-light mt-0.5">
            {listing.bedrooms} bd · {listing.bathrooms} ba · {listing.maxGuests} guests · <span className="font-medium text-aria-text-mid">{listing.pricePerNight} gold/night</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {isDraft && (
            <Link
              to="/host/listings/new"
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              Resume
            </Link>
          )}
          {(isActive || isInactive) && (
            <button
              className="btn btn-secondary text-xs py-1.5 px-3"
              onClick={handleToggle}
              disabled={statusLoading}
            >
              {statusLoading ? '…' : isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          <Link
            to={`/host/listings/${listing.id}/edit`}
            className="btn btn-ghost text-xs py-1.5 px-3"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-aria-offwhite flex items-center justify-between">
        <span className="text-xs text-aria-text-light">
          Created {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
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
        ) : (
          <button
            className="btn btn-ghost text-xs py-1 px-3 text-aria-error hover:bg-red-50"
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function HostDashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'host' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

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
    fetchListings();
  }, [fetchListings]);

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

  const drafts    = listings.filter(l => l.status === 'draft');
  const active    = listings.filter(l => l.status === 'active');
  const inactive  = listings.filter(l => l.status === 'inactive');
  const ordered   = [...drafts, ...active, ...inactive];

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
