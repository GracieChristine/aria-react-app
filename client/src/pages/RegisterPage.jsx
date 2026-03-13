import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function validate(form) {
  const errors = {}
  if (!form.name) {
    errors.name = 'Name is required.'
  }
  if (!form.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const errors = validate(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const [firstName, ...rest] = form.name.trim().split(' ')
      const lastName = rest.join(' ') || ''

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setFieldErrors({ email: 'Email already registered. Try logging in.' })
        return
      }
      if (!res.ok) {
        setServerError(data.message || 'Something went wrong. Please try again.')
        return
      }

      login(data.user, data.accessToken)
      navigate('/')
    } catch {
      setServerError('Unable to connect. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-aria-offwhite px-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="font-serif italic font-normal text-3xl text-aria-text-dark mb-1">
          Welcome to <span className="font-bold tracking-tight text-aria-teal">aria</span>
        </h1>
        <p className="text-aria-text-mid text-sm mb-6">
          Sign up for your next perfect stay
        </p>

        {serverError && (
          <p className="text-aria-error text-sm mb-4">{serverError}</p>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="flex flex-col gap-4">
          <div>
            <label className="label">Full name</label>
            <input
              className={`input ${fieldErrors.name ? 'input-error' : ''}`}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Smith"
              data-lpignore="true"
            />
            {fieldErrors.name && (
              <p className="text-aria-error text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className={`input ${fieldErrors.email ? 'input-error' : ''}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              data-lpignore="true"
            />
            {fieldErrors.email && (
              <p className="text-aria-error text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className={`input ${fieldErrors.password ? 'input-error' : ''}`}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              data-lpignore="true"
            />
            {fieldErrors.password && (
              <p className="text-aria-error text-xs mt-1">{fieldErrors.password}</p>
            )}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              className={`input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              data-lpignore="true"
            />
            {fieldErrors.confirmPassword && (
              <p className="text-aria-error text-xs mt-1">{fieldErrors.confirmPassword}</p>
            )}
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-aria-text-mid mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-aria-teal font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
