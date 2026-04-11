import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

const PROPERTY_TYPES = [
  'cottage', 'manor', 'castle', 'tower', 'treehouse',
  'cavern', 'academy_suite', 'seaside_cove', 'floating_isle', 'hidden_burrow',
];

function toTitleCase(str) {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const EDITABLE_FIELDS = ['title', 'description', 'propertyType', 'bedrooms', 'bathrooms', 'maxGuests', 'pricePerNight'];

function hasChanges(form, original) {
  if (!form || !original) return false;
  return EDITABLE_FIELDS.some(f => String(form[f]) !== String(original[f]));
}

export default function EditListingPage() {
  const { user, token, authReady } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form,     setForm]     = useState(null);
  const [original, setOriginal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  // Load listing
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (!res.ok) { setError('Listing not found.'); return; }
        const l = data.listing;
        const snapshot = {
          title:         l.title,
          description:   l.description,
          address:       l.address,
          city:          l.city,
          region:        l.region,
          world:         l.world,
          propertyType:  l.propertyType,
          bedrooms:      l.bedrooms,
          bathrooms:     l.bathrooms,
          maxGuests:     l.maxGuests,
          pricePerNight: l.pricePerNight,
          worldId:       l.worldId,
          regionId:      l.regionId,
          cityId:        l.cityId,
          createdAt:     l.createdAt,
          updatedAt:     l.updatedAt,
        };
        setForm(snapshot);
        setOriginal(snapshot);
      } catch {
        setError('Unable to load listing.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'host' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
  }

  function isValid() {
    if (!form) return false;
    return (
      form.title.trim().length > 0 && form.title.trim().length <= 50 &&
      form.description.trim().length > 0 && form.description.trim().length <= 500 &&
      form.pricePerNight > 0 &&
      PROPERTY_TYPES.includes(form.propertyType)
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:         form.title.trim(),
          description:   form.description.trim(),
          propertyType:  form.propertyType,
          bedrooms:      Number(form.bedrooms),
          bathrooms:     Number(form.bathrooms),
          maxGuests:     Number(form.maxGuests),
          pricePerNight: Number(form.pricePerNight),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.errors) && data.errors.length
          ? data.errors.map(err => err.msg).join(' · ')
          : data.message ?? 'Failed to save changes.';
        setError(msg);
        return;
      }
      setOriginal(form);
      setSuccess(true);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-aria-offwhite">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif italic font-normal text-3xl text-aria-text-dark">Edit listing</h1>
          <button className="btn btn-ghost text-sm" onClick={() => navigate('/host/dashboard')}>
            ← Back to dashboard
          </button>
        </div>

        {loading && <p className="text-sm text-aria-text-light">Loading…</p>}
        {!loading && error && !form && <p className="text-sm text-aria-error">{error}</p>}

        {!loading && form && (
          <form onSubmit={handleSave} noValidate className="bg-white rounded-2xl shadow-aria-md p-8 flex flex-col gap-6">

            {/* Type */}
            <div>
              <label className="label">Property type</label>
              <select
                className="input w-full mt-1"
                value={form.propertyType}
                onChange={e => handleChange('propertyType', e.target.value)}
              >
                {PROPERTY_TYPES.map(t => (
                  <option key={t} value={t}>{toTitleCase(t)}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="label">Title</label>
              <input
                className="input w-full mt-1"
                type="text"
                maxLength={50}
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
              />
              <p className="text-xs text-aria-text-light mt-1 text-right">{form.title.length}/50</p>
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                className="input w-full mt-1 resize-none"
                rows={5}
                maxLength={500}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
              <p className="text-xs text-aria-text-light mt-1 text-right">{form.description.length}/500</p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" min="0" max="20" className="input w-full mt-1"
                  value={form.bedrooms} onChange={e => handleChange('bedrooms', e.target.value)} />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input type="number" min="1" max="20" className="input w-full mt-1"
                  value={form.bathrooms} onChange={e => handleChange('bathrooms', e.target.value)} />
              </div>
              <div>
                <label className="label">Max guests</label>
                <input type="number" min="1" max="20" className="input w-full mt-1"
                  value={form.maxGuests} onChange={e => handleChange('maxGuests', e.target.value)} />
              </div>
              <div>
                <label className="label">Price per night (gold)</label>
                <input type="number" min="1" className="input w-full mt-1"
                  value={form.pricePerNight} onChange={e => handleChange('pricePerNight', e.target.value)} />
              </div>
            </div>

            {/* Location — read only */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-aria-text-light">Location</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Address', value: form.address },
                  { label: 'City',    value: form.city },
                  { label: 'Region',  value: form.region },
                  { label: 'World',   value: form.world },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-aria-text-light mb-0.5">{label}</p>
                    <p className="text-aria-text-dark">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-aria-text-light">To change the location, delete this listing and create a new one.</p>
            </div>

            {/* Timestamps — read only */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-aria-text-light">History</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-aria-text-light mb-0.5">Created</p>
                  <p className="text-aria-text-dark">
                    {new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-aria-text-light mb-0.5">Last modified</p>
                  <p className="text-aria-text-dark">
                    {new Date(form.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {error   && <p className="text-sm text-aria-error">{error}</p>}
            {success && <p className="text-sm text-aria-teal">Changes saved.</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="btn btn-ghost text-sm" onClick={() => navigate('/host/dashboard')}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-sm"
                disabled={saving || !isValid() || !hasChanges(form, original)}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
