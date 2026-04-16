import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function DevSeedWidget() {
  const { token } = useAuth();
  const [open, setOpen]       = useState(false);
  const [status, setStatus]   = useState(null);  // { ok, message }
  const [loading, setLoading] = useState(null);   // 'seed' | 'unseed' | null

  async function call(endpoint, type) {
    setLoading(type);
    setStatus(null);
    try {
      const res  = await fetch(`/api/dev/${endpoint}`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStatus({ ok: res.ok, message: res.ok ? data.message : data.error });
      if (res.ok) window.dispatchEvent(new CustomEvent('aria:listings-updated'));
    } catch {
      setStatus({ ok: false, message: 'Network error — is the server running?' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-72 rounded-xl border border-aria-border bg-white shadow-lg p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-aria-text-light">Dev tools</p>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => call('seed-listings', 'seed')}
              disabled={!!loading}
              className="w-full rounded-lg bg-aria-teal px-3 py-2 text-sm font-medium text-white hover:bg-aria-teal/90 disabled:opacity-50 transition-colors"
            >
              {loading === 'seed' ? 'Seeding…' : 'Seed 30 listings'}
            </button>
            <button
              onClick={() => call('unseed-listings', 'unseed')}
              disabled={!!loading}
              className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {loading === 'unseed' ? 'Removing…' : 'Unseed listings'}
            </button>
          </div>

          {status && (
            <p className={`text-xs leading-snug ${status.ok ? 'text-green-600' : 'text-red-500'}`}>
              {status.message}
            </p>
          )}

          <p className="text-[0.65rem] text-aria-text-light leading-snug">
            Seeded listings are tagged to your account. Deactivate all before unseeding.
          </p>
        </div>
      )}

      <button
        onClick={() => { setOpen((o) => !o); setStatus(null); }}
        title={open ? 'Close dev tools' : 'Open dev tools'}
        className="w-10 h-10 rounded-full bg-aria-teal text-white shadow-lg flex items-center justify-center hover:bg-aria-teal/90 transition-colors"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
