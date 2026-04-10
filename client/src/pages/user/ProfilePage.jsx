import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const formInitialized = useRef(false);

  const [activeSection, setActiveSection] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    bio:       '',
  });

  useEffect(() => {
    if (user && !formInitialized.current) {
      formInitialized.current = true;
      setProfileForm({
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
        email:     user.email     ?? '',
        phone:     user.phone     ?? '',
        bio:       user.bio       ?? '',
      });
    }
  }, [user]);

  const [profileEditing, setProfileEditing] = useState(false);
  const [profileError, setProfileError]     = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError]     = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Become-a-host
  const [hostError, setHostError]     = useState('');
  const [hostLoading, setHostLoading] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  // ── Profile ───────────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.firstName.trim()) {
      setProfileError('First name is required.');
      return;
    }
    if (!profileForm.lastName.trim()) {
      setProfileError('Last name is required.');
      return;
    }
    if (!profileForm.email.trim()) {
      setProfileError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      setProfileError('Please enter a valid email address.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch('/api/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.message || 'Failed to update profile.');
        return;
      }
      updateUser(data.user);
      setProfileSuccess('Profile updated.');
      setProfileEditing(false);
    } catch {
      setProfileError('Unable to connect. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Password ──────────────────────────────────────────────
  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (!passwordForm.confirmPassword) {
      setPasswordError('Please confirm your new password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/users/me/password', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword:     passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setPasswordError('Current password is incorrect.');
        return;
      }
      if (!res.ok) {
        setPasswordError(data.message || 'Failed to update password.');
        return;
      }
      setPasswordSuccess('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPasswordError('Unable to connect. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  }

  // ── Become a host ─────────────────────────────────────────
  async function handleBecomeHost() {
    setHostError('');
    setHostLoading(true);
    try {
      const res = await fetch('/api/users/me/become-host', {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setHostError(data.message || 'Failed to update role.');
        return;
      }
      updateUser(data.user);
      navigate('/host/listings/new');
    } catch {
      setHostError('Unable to connect. Please try again.');
    } finally {
      setHostLoading(false);
    }
  }

  const navItems = [
    { key: 'profile',  label: 'Profile' },
    { key: 'password', label: 'Password' },
    ...(user?.role === 'guest' ? [{ key: 'host', label: 'Become a host' }] : []),
  ];

  return (
    <div className="min-h-screen bg-aria-offwhite">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif italic font-normal text-3xl text-aria-text-dark mb-8">
          Your account
        </h1>

        <div className="grid gap-6" style={{ gridTemplateColumns: '240px 1fr' }}>

          {/* ── Sidebar ── */}
          <aside className="bg-white border border-aria-soft-gray rounded-2xl shadow-aria-sm overflow-hidden">
            <div className="px-6 py-7 flex flex-col items-center text-center gap-3 border-b border-aria-soft-gray">
              <div className="w-[72px] h-[72px] rounded-full bg-aria-teal flex items-center justify-center font-serif italic text-2xl text-white font-medium">
                {initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-aria-text-dark">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[0.7rem] text-aria-text-light uppercase tracking-widest mt-0.5">
                  {user?.role}
                </div>
              </div>
            </div>

            <nav>
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={[
                    'w-full text-left px-6 py-[0.8rem] text-sm border-b border-aria-offwhite transition-colors',
                    'border-l-[3px]',
                    activeSection === item.key
                      ? 'border-l-aria-teal bg-aria-offwhite text-aria-teal font-semibold'
                      : 'border-l-transparent text-aria-text-mid hover:bg-aria-offwhite',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Main card ── */}
          <main className="bg-white border border-aria-soft-gray rounded-2xl shadow-aria-sm overflow-hidden">

            {activeSection === 'profile' && (
              <>
                <div className="flex items-center justify-between px-7 py-5 bg-aria-offwhite border-b border-aria-soft-gray">
                  <span className="font-serif italic text-aria-text-dark text-[1.1rem]">Profile</span>
                  {!profileEditing && (
                    <button className="btn-ghost text-sm" onClick={() => { setProfileError(''); setProfileSuccess(''); setProfileEditing(true); }}>
                      Edit
                    </button>
                  )}
                </div>

                {profileError   && <p className="px-7 pt-5 text-aria-error text-sm">{profileError}</p>}
                {profileSuccess && <p className="px-7 pt-5 text-aria-teal text-sm">{profileSuccess}</p>}

                {!profileEditing ? (
                  <div className="px-7 py-6 flex flex-col gap-0">
                    {[
                      { label: 'Name',  value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() },
                      { label: 'Email', value: user?.email },
                      { label: 'Phone', value: user?.phone || '—' },
                      { label: 'Bio',   value: user?.bio   || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-baseline py-[0.55rem] border-b border-aria-offwhite last:border-b-0">
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.06em] text-aria-text-light w-20 shrink-0">{label}</span>
                        <span className="text-sm text-aria-text-dark">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={handleProfileSave} noValidate className="px-7 py-6 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">First name</label>
                        <input
                          className="input"
                          type="text"
                          value={profileForm.firstName}
                          onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          data-lpignore="true"
                        />
                      </div>
                      <div>
                        <label className="label">Last name</label>
                        <input
                          className="input"
                          type="text"
                          value={profileForm.lastName}
                          onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          data-lpignore="true"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Email address</label>
                      <input
                        className="input"
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        data-lpignore="true"
                      />
                    </div>

                    <div>
                      <label className="label">Phone</label>
                      <input
                        className="input"
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Add a phone number"
                        data-lpignore="true"
                      />
                    </div>

                    <div>
                      <label className="label">Bio</label>
                      <textarea
                        className="input min-h-[90px] resize-y"
                        value={profileForm.bio}
                        onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell hosts a little about yourself…"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <button type="button" className="btn-ghost text-sm" onClick={() => setProfileEditing(false)}>
                        Cancel
                      </button>
                      <button className="btn-primary text-sm" type="submit" disabled={profileLoading}>
                        {profileLoading ? 'Saving…' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {activeSection === 'password' && (
              <>
                <div className="px-7 py-5 bg-aria-offwhite border-b border-aria-soft-gray">
                  <span className="font-serif italic text-aria-text-dark text-[1.1rem]">Change password</span>
                </div>
                <form onSubmit={handlePasswordSave} noValidate autoComplete="off" className="px-7 py-6 flex flex-col gap-4">
                  {passwordError   && <p className="text-aria-error text-sm">{passwordError}</p>}
                  {passwordSuccess && <p className="text-aria-teal text-sm">{passwordSuccess}</p>}

                  <div>
                    <label className="label">Current password</label>
                    <input
                      className="input"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      data-lpignore="true"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">New password</label>
                      <input
                        className="input"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        data-lpignore="true"
                      />
                    </div>
                    <div>
                      <label className="label">Confirm new password</label>
                      <input
                        className="input"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        data-lpignore="true"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button className="btn-primary text-sm" type="submit" disabled={passwordLoading}>
                      {passwordLoading ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeSection === 'host' && (
              <>
                <div className="px-7 py-5 bg-aria-offwhite border-b border-aria-soft-gray">
                  <span className="font-serif italic text-aria-text-dark text-[1.1rem]">Become a host</span>
                </div>
                <div className="px-7 py-6">
                  {hostError && <p className="text-aria-error text-sm mb-4">{hostError}</p>}
                  <p className="text-sm text-aria-text-mid leading-relaxed mb-6">
                    Share your space and start earning. Create your first listing to get started.
                  </p>
                  <button
                    className="btn-primary text-sm"
                    onClick={handleBecomeHost}
                    disabled={hostLoading}
                  >
                    {hostLoading ? 'Updating…' : 'Get started as a host'}
                  </button>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}