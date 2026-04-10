import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

// ── Property type definitions ────────────────────────────────────────────────

const PROPERTY_TYPES = [
  {
    value: 'cottage',
    label: 'Cottage',
    description: 'Cosy and tucked away',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <path d="M2 26 Q26 6 50 26 L50 30 Q26 10 2 30 Z" fill="#C0714A" stroke="none"/>
        <path d="M2 26 Q26 6 50 26" stroke="#3A6070" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M4 28 Q26 9 48 28" stroke="#EDE8E0" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
        <path d="M6 30 Q26 12 46 30" stroke="#EDE8E0" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
        <rect x="8" y="27" width="36" height="17" rx="1.5" fill="#FEFCF8" stroke="#3A6070" strokeWidth="2"/>
        <path d="M22 44 V36 a4 4 0 0 1 8 0 V44" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.5"/>
        <rect x="11" y="30" width="8" height="6" rx="1" fill="#F0C870" stroke="#3A6070" strokeWidth="1.4"/>
        <rect x="33" y="30" width="8" height="6" rx="1" fill="#F0C870" stroke="#3A6070" strokeWidth="1.4"/>
        <rect x="14" y="17" width="4" height="9" fill="#C4B08A" stroke="#3A6070" strokeWidth="1.5"/>
        <path d="M15 17 Q18 14 15 11" stroke="#A8B8C0" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    value: 'manor',
    label: 'Manor',
    description: 'Grand and stately',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="6" y="18" width="40" height="26" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <rect x="10" y="10" width="4" height="8" fill="#C0714A" stroke="#3A6070" strokeWidth="1.5"/>
        <rect x="38" y="10" width="4" height="8" fill="#C0714A" stroke="#3A6070" strokeWidth="1.5"/>
        <rect x="24" y="12" width="4" height="6" fill="#C0714A" stroke="#3A6070" strokeWidth="1.5"/>
        <line x1="6" y1="18" x2="46" y2="18" stroke="#3A6070" strokeWidth="2" strokeLinecap="round"/>
        <rect x="9" y="22" width="6" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="12" y1="22" x2="12" y2="28" stroke="#3A6070" strokeWidth="0.8"/>
        <rect x="23" y="22" width="6" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="26" y1="22" x2="26" y2="28" stroke="#3A6070" strokeWidth="0.8"/>
        <rect x="37" y="22" width="6" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="40" y1="22" x2="40" y2="28" stroke="#3A6070" strokeWidth="0.8"/>
        <rect x="9" y="32" width="6" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="37" y="32" width="6" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="22" y="32" width="8" height="12" rx="0.5" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.3"/>
        <path d="M22 32 a4 4 0 0 1 8 0" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="6" y1="44" x2="46" y2="44" stroke="#3A6070" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'castle',
    label: 'Castle',
    description: 'Towers and ramparts',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="12" y="26" width="28" height="18" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <rect x="4" y="18" width="10" height="26" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <rect x="38" y="18" width="10" height="26" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <path d="M4 18 L9 8 L14 18 Z" fill="#C0714A" stroke="#3A6070" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M38 18 L43 8 L48 18 Z" fill="#C0714A" stroke="#3A6070" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M12 26 V20 M16 26 V20 M20 26 V20 M24 26 V20 M28 26 V20 M32 26 V20 M36 26 V20 M40 26 V20" stroke="#3A6070" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="40" y2="20" stroke="#3A6070" strokeWidth="1.8"/>
        <line x1="9" y1="8" x2="9" y2="3" stroke="#3A6070" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 3 L14 5 L9 7 Z" fill="#3A6070"/>
        <line x1="43" y1="8" x2="43" y2="3" stroke="#3A6070" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M43 3 L48 5 L43 7 Z" fill="#3A6070"/>
        <path d="M21 44 V35 a5 5 0 0 1 10 0 V44" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.5"/>
        <circle cx="9" cy="24" r="2.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <circle cx="43" cy="24" r="2.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    value: 'tower',
    label: 'Tower',
    description: 'Tall, solitary, magical',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="19" y="18" width="14" height="32" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <path d="M17 18 L26 5 L35 18" fill="#C0714A" stroke="#3A6070" strokeWidth="2" strokeLinejoin="round"/>
        <line x1="26" y1="5" x2="26" y2="2" stroke="#3A6070" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="23" y1="3" x2="29" y2="3" stroke="#3A6070" strokeWidth="1.3" strokeLinecap="round"/>
        <rect x="24" y="20" width="4" height="8" rx="2" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="24" y="31" width="4" height="8" rx="2" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="19" y1="28" x2="33" y2="28" stroke="#3A6070" strokeWidth="0.8" opacity="0.3"/>
        <line x1="19" y1="38" x2="33" y2="38" stroke="#3A6070" strokeWidth="0.8" opacity="0.3"/>
        <path d="M22 50 V45 a4 4 0 0 1 8 0 V50" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.4"/>
        <circle cx="24" cy="47" r="1.1" fill="#3A6070"/>
      </svg>
    ),
  },
  {
    value: 'treehouse',
    label: 'Treehouse',
    description: 'Perched in the canopy',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="22" y="27" width="8" height="23" rx="2" fill="#9B6845" stroke="#3A6070" strokeWidth="2"/>
        <rect x="10" y="22" width="32" height="5" rx="1" fill="#9B6845" stroke="#3A6070" strokeWidth="2"/>
        <rect x="14" y="8" width="24" height="14" rx="1" fill="#FEFCF8" stroke="#3A6070" strokeWidth="2.2"/>
        <path d="M12 8 L26 1 L40 8" fill="#C0714A" stroke="#3A6070" strokeWidth="2.2" strokeLinejoin="round"/>
        <rect x="22" y="13" width="8" height="9" rx="0.5" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.5"/>
        <line x1="38" y1="50" x2="38" y2="27" stroke="#9B6845" strokeWidth="2" strokeLinecap="round"/>
        <line x1="44" y1="50" x2="44" y2="27" stroke="#9B6845" strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="44" x2="44" y2="44" stroke="#7A4A28" strokeWidth="1.8"/>
        <line x1="38" y1="38" x2="44" y2="38" stroke="#7A4A28" strokeWidth="1.8"/>
        <line x1="38" y1="32" x2="44" y2="32" stroke="#7A4A28" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    value: 'cavern',
    label: 'Cavern',
    description: 'Deep and hidden',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <path d="M2 48 Q2 24 16 16 Q26 10 36 16 Q50 24 50 48 Z" fill="#C4B08A" stroke="#3A6070" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M14 48 L14 34 Q14 24 26 24 Q38 24 38 34 L38 48 Z" fill="#7A5C3A" stroke="#3A6070" strokeWidth="1.8"/>
        <path d="M19 24 L17 30" stroke="#EDE8E0" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M26 22 L26 29" stroke="#EDE8E0" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M33 24 L35 30" stroke="#EDE8E0" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M18 48 L20 41" stroke="#EDE8E0" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M34 48 L32 41" stroke="#EDE8E0" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="26" cy="38" r="3" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    value: 'academy_suite',
    label: 'Academy Suite',
    description: 'Within the halls of learning',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <rect x="6" y="20" width="40" height="24" rx="1" fill="#EDE8E0" stroke="#3A6070" strokeWidth="2"/>
        <path d="M4 20 L26 8 L48 20 Z" fill="#C0714A" stroke="#3A6070" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 44 V26 Q20 20 26 20 Q32 20 32 26 V44" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.5"/>
        <line x1="21" y1="30" x2="31" y2="30" stroke="#F0C870" strokeWidth="1" strokeLinecap="round"/>
        <line x1="21" y1="34" x2="31" y2="34" stroke="#F0C870" strokeWidth="1" strokeLinecap="round"/>
        <line x1="21" y1="38" x2="31" y2="38" stroke="#F0C870" strokeWidth="1" strokeLinecap="round"/>
        <rect x="8" y="26" width="8" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="36" y="26" width="8" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <line x1="26" y1="8" x2="26" y2="2" stroke="#3A6070" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M26 2 L32 4 L26 6 Z" fill="#3A6070"/>
        <line x1="14" y1="20" x2="14" y2="44" stroke="#3A6070" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="38" y1="20" x2="38" y2="44" stroke="#3A6070" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: 'seaside_cove',
    label: 'Seaside Cove',
    description: "By the water's edge",
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <path d="M28 50 L28 36 Q28 30 36 28 L50 28 L50 50 Z" fill="#7DA87A" stroke="#3A6070" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 44 Q8 41 14 44 Q20 41 26 44 L26 50 L2 50 Z" fill="#B8D4DC"/>
        <path d="M2 46 Q6 44 10 46 Q14 44 18 46 Q22 44 26 46" stroke="#A8B8C0" strokeWidth="1" strokeLinecap="round" fill="none"/>
        <rect x="32" y="12" width="10" height="16" rx="1" fill="#FEFCF8" stroke="#3A6070" strokeWidth="1.8"/>
        <line x1="32" y1="18" x2="42" y2="18" stroke="#C0714A" strokeWidth="1.3"/>
        <line x1="32" y1="23" x2="42" y2="23" stroke="#C0714A" strokeWidth="1.3"/>
        <rect x="30" y="8" width="14" height="5" rx="1" fill="#C0714A" stroke="#3A6070" strokeWidth="1.5"/>
        <rect x="33" y="2" width="8" height="7" rx="2" fill="#C0714A" stroke="#3A6070" strokeWidth="1.5"/>
        <polygon points="37,0 33,2 41,2" fill="#3A6070"/>
        <path d="M33 5 L4 18 L4 24 L33 9 Z" fill="#F0C870" opacity="0.15"/>
        <path d="M35 28 V24 a2 2 0 0 1 4 0 V28" fill="#7A4A28" stroke="#3A6070" strokeWidth="1.2"/>
        <path d="M28 40 Q32 38 36 40 Q40 42 44 40" stroke="#3A6070" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
      </svg>
    ),
  },
  {
    value: 'floating_isle',
    label: 'Floating Isle',
    description: 'Above the clouds',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <path d="M6 28 Q6 22 26 22 Q46 22 46 28 Q46 32 40 34 Q34 38 26 38 Q18 38 12 34 Q6 32 6 28 Z" fill="#7DA87A" stroke="#3A6070" strokeWidth="2"/>
        <rect x="16" y="14" width="20" height="10" rx="1" fill="#FEFCF8" stroke="#3A6070" strokeWidth="1.8"/>
        <path d="M14 14 L26 7 L38 14" fill="#C0714A" stroke="#3A6070" strokeWidth="1.8" strokeLinejoin="round"/>
        <rect x="24" y="18" width="5" height="6" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="17" y="17" width="5" height="4" rx="0.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.2"/>
        <rect x="32" y="9" width="3" height="5" rx="0.5" fill="#C0714A" stroke="#3A6070" strokeWidth="1.2"/>
        <path d="M8 42 Q14 39 20 42 Q26 39 32 42 Q38 40 44 43" stroke="#A8B8C0" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        <path d="M4 46 Q10 43 16 46 Q22 43 28 46" stroke="#A8B8C0" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      </svg>
    ),
  },
  {
    value: 'hidden_burrow',
    label: 'Hidden Burrow',
    description: 'Snug and out of sight',
    icon: (
      <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
        <path d="M2 46 Q2 14 26 14 Q50 14 50 46 Z" fill="#7DA87A" stroke="#3A6070" strokeWidth="2"/>
        <line x1="2" y1="46" x2="50" y2="46" stroke="#3A6070" strokeWidth="1.8"/>
        <circle cx="26" cy="40" r="9" fill="#C0714A" stroke="#3A6070" strokeWidth="2"/>
        <circle cx="26" cy="40" r="6.5" fill="#FEFCF8" stroke="#3A6070" strokeWidth="1.4"/>
        <line x1="26" y1="33.5" x2="26" y2="46.5" stroke="#3A6070" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="23.2" cy="40" r="1.3" fill="none" stroke="#3A6070" strokeWidth="1.2"/>
        <circle cx="28.8" cy="40" r="1.3" fill="none" stroke="#3A6070" strokeWidth="1.2"/>
        <circle cx="12" cy="34" r="4.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.5"/>
        <line x1="9.5" y1="34" x2="14.5" y2="34" stroke="#3A6070" strokeWidth="0.8"/>
        <line x1="12" y1="31.5" x2="12" y2="36.5" stroke="#3A6070" strokeWidth="0.8"/>
        <circle cx="40" cy="34" r="4.5" fill="#F0C870" stroke="#3A6070" strokeWidth="1.5"/>
        <line x1="37.5" y1="34" x2="42.5" y2="34" stroke="#3A6070" strokeWidth="0.8"/>
        <line x1="40" y1="31.5" x2="40" y2="36.5" stroke="#3A6070" strokeWidth="0.8"/>
        <rect x="32" y="20" width="4" height="7" rx="1" fill="#C4B08A" stroke="#3A6070" strokeWidth="1.4"/>
        <path d="M33 20 Q35 17 34 14" stroke="#A8B8C0" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
        <line x1="19" y1="46" x2="19" y2="42" stroke="#3A6070" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="33" y1="46" x2="33" y2="42" stroke="#3A6070" strokeWidth="1.3" strokeLinecap="round"/>
        <line x1="19" y1="43" x2="33" y2="43" stroke="#3A6070" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
];

// ── Step components ──────────────────────────────────────────────────────────

function StepType({ value, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-aria-blush mb-2">Step 1 of 5</p>
      <h1 className="font-serif italic text-2xl font-normal text-aria-text-dark mb-1">What kind of place is it?</h1>
      <p className="text-sm text-aria-text-mid mb-6">Choose the type that best describes your property.</p>
      <div className="grid grid-cols-2 gap-3">
        {PROPERTY_TYPES.map(pt => (
          <button
            key={pt.value}
            type="button"
            onClick={() => onChange(pt.value)}
            className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition
              ${value === pt.value
                ? 'border-aria-teal bg-aria-teal-light'
                : 'border-aria-soft-gray hover:border-aria-teal hover:bg-aria-teal-light'}`}
          >
            {pt.icon}
            <div>
              <p className={`font-semibold text-sm ${value === pt.value ? 'text-aria-teal' : 'text-aria-text-dark'}`}>
                {pt.label}
              </p>
              <p className="text-xs text-aria-text-light">{pt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepAbout({ form, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-aria-blush mb-2">Step 2 of 5</p>
      <h1 className="font-serif italic text-2xl font-normal text-aria-text-dark mb-1">Tell guests about your place</h1>
      <p className="text-sm text-aria-text-mid mb-6">A good title and description help guests imagine being there.</p>
      <div className="flex flex-col gap-5">
        <div>
          <label className="label">Title</label>
          <input
            className="input w-full mt-1"
            placeholder="e.g. Moonlit Cottage in the Whispering Woods"
            maxLength={50}
            value={form.title}
            onChange={e => onChange('title', e.target.value)}
          />
          <p className="text-xs text-aria-text-light mt-1 text-right">{form.title.length}/50</p>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input w-full mt-1 resize-none"
            rows={5}
            placeholder="Describe what makes your place special..."
            maxLength={500}
            value={form.description}
            onChange={e => onChange('description', e.target.value)}
          />
          <p className="text-xs text-aria-text-light mt-1 text-right">{form.description.length}/500</p>
        </div>
      </div>
    </div>
  );
}

function StepDetails({ form, onChange }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-aria-blush mb-2">Step 3 of 5</p>
      <h1 className="font-serif italic text-2xl font-normal text-aria-text-dark mb-1">Share the details</h1>
      <p className="text-sm text-aria-text-mid mb-6">Help guests know what to expect.</p>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="label">Bedrooms</label>
          <input
            type="number" min="0" max="20"
            className="input w-full mt-1"
            value={form.bedrooms}
            onChange={e => onChange('bedrooms', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Bathrooms</label>
          <input
            type="number" min="1" max="20"
            className="input w-full mt-1"
            value={form.bathrooms}
            onChange={e => onChange('bathrooms', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Max guests</label>
          <input
            type="number" min="1" max="20"
            className="input w-full mt-1"
            value={form.maxGuests}
            onChange={e => onChange('maxGuests', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Price per night (gold)</label>
          <input
            type="number" min="1"
            className="input w-full mt-1"
            placeholder="e.g. 120"
            value={form.pricePerNight}
            onChange={e => onChange('pricePerNight', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepLocation({ form, onChange }) {
  const [universes, setUniverses] = useState([]);
  const [worlds,    setWorlds]    = useState([]);
  const [regions,   setRegions]   = useState([]);
  const [cities,    setCities]    = useState([]);

  useEffect(() => {
    fetch('/api/locations/universes')
      .then(r => r.json())
      .then(d => setUniverses(d.universes ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.universeId) return;
    fetch(`/api/locations/universes/${form.universeId}/worlds`)
      .then(r => r.json())
      .then(d => setWorlds(d.worlds ?? []))
      .catch(() => {});
  }, [form.universeId]);

  useEffect(() => {
    if (!form.worldId) return;
    fetch(`/api/locations/worlds/${form.worldId}/regions`)
      .then(r => r.json())
      .then(d => setRegions(d.regions ?? []))
      .catch(() => {});
  }, [form.worldId]);

  useEffect(() => {
    if (!form.regionId) return;
    fetch(`/api/locations/regions/${form.regionId}/cities`)
      .then(r => r.json())
      .then(d => setCities(d.cities ?? []))
      .catch(() => {});
  }, [form.regionId]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-aria-blush mb-2">Step 4 of 5</p>
      <h1 className="font-serif italic text-2xl font-normal text-aria-text-dark mb-1">Where is it?</h1>
      <p className="text-sm text-aria-text-mid mb-6">Tell guests where to find you.</p>
      <div className="flex flex-col gap-5">
        <div>
          <label className="label">Address</label>
          <input
            className="input w-full mt-1"
            placeholder="e.g. 4 Privet Drive"
            value={form.address}
            onChange={e => onChange('address', e.target.value)}
          />
          <p className="text-xs text-aria-text-light mt-1">Must start with a number and end with a street type</p>
        </div>
        <div>
          <label className="label">Universe</label>
          <select
            className="input w-full mt-1"
            value={form.universeId}
            onChange={e => {
              onChange('universeId', e.target.value);
              onChange('worldId',    '');
              onChange('regionId',   '');
              onChange('cityId',     '');
            }}
          >
            <option value="">Select a universe</option>
            {universes.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">World</label>
          <select
            className="input w-full mt-1"
            value={form.worldId}
            onChange={e => {
              onChange('worldId',  e.target.value);
              onChange('regionId', '');
              onChange('cityId',   '');
            }}
            disabled={!form.universeId}
          >
            <option value="">Select a world</option>
            {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Region</label>
          <select
            className="input w-full mt-1"
            value={form.regionId}
            onChange={e => {
              onChange('regionId', e.target.value);
              onChange('cityId',   '');
            }}
            disabled={!form.worldId}
          >
            <option value="">Select a region</option>
            {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <select
            className="input w-full mt-1"
            value={form.cityId}
            onChange={e => onChange('cityId', e.target.value)}
            disabled={!form.regionId}
          >
            <option value="">Select a city</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function StepReview({ form }) {
  const type = PROPERTY_TYPES.find(pt => pt.value === form.propertyType);
  const rows = [
    { label: 'Type',         value: type?.label ?? '—' },
    { label: 'Title',        value: form.title || '—' },
    { label: 'Description',  value: form.description || '—' },
    { label: 'Bedrooms',     value: form.bedrooms },
    { label: 'Bathrooms',    value: form.bathrooms },
    { label: 'Max guests',   value: form.maxGuests },
    { label: 'Price/night',  value: form.pricePerNight ? `${form.pricePerNight} gold` : '—' },
    { label: 'Address',      value: form.address || '—' },
  ];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-aria-blush mb-2">Step 5 of 5</p>
      <h1 className="font-serif italic text-2xl font-normal text-aria-text-dark mb-1">Review your listing</h1>
      <p className="text-sm text-aria-text-mid mb-6">
        Your listing will be saved as <span className="font-semibold text-aria-text-dark">inactive</span> — activate it from your host dashboard when you're ready.
      </p>
      <dl className="divide-y divide-aria-soft-gray">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex gap-4 py-3">
            <dt className="w-32 shrink-0 text-sm text-aria-text-light">{label}</dt>
            <dd className="text-sm text-aria-text-dark break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Type', 'About', 'Details', 'Location', 'Review'];

function ProgressBar({ step }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-px bg-aria-soft-gray z-0" />
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1;
          const done    = idx < step;
          const current = idx === step;
          return (
            <div key={label} className="flex-1 flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-aria-sm
                ${done    ? 'bg-aria-teal text-white' : ''}
                ${current ? 'bg-aria-teal text-white ring-4 ring-aria-teal-light' : ''}
                ${!done && !current ? 'bg-white border-2 border-aria-soft-gray text-aria-text-light' : ''}`}
              >
                {done ? '✓' : idx}
              </div>
              <span className={`text-xs mt-1 font-semibold ${done || current ? 'text-aria-teal' : 'text-aria-text-light'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

const ADDRESS_REGEX = /^\d+\s+.+\s+(St|Street|Dr|Drive|Ave|Avenue|Blvd|Boulevard|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Terrace|Ter|Cres|Crescent|Mews|Row|Walk|Close|Alley|Al|Pass|Gate|Hill|Rise|View|Path)\.?$/i;

const INITIAL_FORM = {
  propertyType:  '',
  title:         '',
  description:   '',
  bedrooms:      1,
  bathrooms:     1,
  maxGuests:     2,
  pricePerNight: '',
  universeId:    '',
  worldId:       '',
  regionId:      '',
  cityId:        '',
  address:       '',
};

export default function ListingSetupPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState(INITIAL_FORM);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'host' && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 1) return !!form.propertyType;
    if (step === 2) return form.title.trim().length > 0 && form.title.trim().length <= 50 && form.description.trim().length > 0 && form.description.trim().length <= 500;
    if (step === 3) return form.pricePerNight > 0;
    if (step === 4) return !!(form.universeId && form.worldId && form.regionId && form.cityId && ADDRESS_REGEX.test(form.address.trim()));
    return true;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:         form.title.trim(),
          description:   form.description.trim(),
          address:       form.address.trim(),
          cityId:        form.cityId,
          regionId:      form.regionId,
          worldId:       form.worldId,
          pricePerNight: Number(form.pricePerNight),
          maxGuests:     Number(form.maxGuests),
          bedrooms:      Number(form.bedrooms),
          bathrooms:     Number(form.bathrooms),
          propertyType:  form.propertyType,
          status:        'inactive',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.errors) && data.errors.length
          ? data.errors.map(e => e.msg).join(' · ')
          : data.message ?? 'Failed to create listing. Please check your details and try again.';
        setError(msg);
        return;
      }

      navigate('/host/dashboard');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-aria-offwhite">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <ProgressBar step={step} />

        <div className="bg-white rounded-2xl shadow-aria-md p-8 mb-6">
          {step === 1 && <StepType    value={form.propertyType} onChange={v => handleChange('propertyType', v)} />}
          {step === 2 && <StepAbout   form={form} onChange={handleChange} />}
          {step === 3 && <StepDetails form={form} onChange={handleChange} />}
          {step === 4 && <StepLocation form={form} onChange={handleChange} />}
          {step === 5 && <StepReview  form={form} />}

          {error && <p className="mt-4 text-sm text-aria-error">{error}</p>}
        </div>

        <div className="flex justify-between">
          {step > 1
            ? <button className="btn btn-secondary" onClick={() => { setError(null); setStep(s => s - 1); }}>Back</button>
            : <div />
          }
          {step < 5
            ? (
              <button
                className="btn btn-primary"
                disabled={!canAdvance()}
                onClick={() => { setError(null); setStep(s => s + 1); }}
              >
                Continue
              </button>
            )
            : (
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? 'Saving…' : 'Create listing'}
              </button>
            )
          }
        </div>
      </main>
    </div>
  );
}