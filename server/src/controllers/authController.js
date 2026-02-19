import { userModel }                        from '../models/userModel.js'
import { hashPassword, comparePassword }    from '../utils/password.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { successResponse, errorResponse }   from '../utils/response.js'

const formatUser = (user) => ({
  id:         user.id,
  email:      user.email,
  firstName:  user.first_name,
  lastName:   user.last_name,
  avatarUrl:  user.avatar_url,
  role:       user.role,
  bio:        user.bio,
  phone:      user.phone,
  isVerified: user.is_verified,
  createdAt:  user.created_at,
})

export const authController = {
  // ── Register ──
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body

      const existing = await userModel.findByEmail(email)
      if (existing) {
        return errorResponse(res, 'Email already in use', 409)
      }

      const passwordHash = await hashPassword(password)
      const userRole     = 'guest'

      const user = await userModel.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole,
      })

      const accessToken  = signAccessToken({ id: user.id, role: user.role })
      const refreshToken = signRefreshToken({ id: user.id })

      return successResponse(res, {
        user:         formatUser(user),
        accessToken,
        refreshToken,
      }, 201)
    } catch (err) {
      console.error('Register error:', err)
      return errorResponse(res, 'Registration failed', 500)
    }
  },

  // ── Login ──
  async login(req, res) {
    try {
      const { email, password } = req.body

      const user = await userModel.findByEmail(email)
      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401)
      }

      const valid = await comparePassword(password, user.password_hash)
      if (!valid) {
        return errorResponse(res, 'Invalid email or password', 401)
      }

      const accessToken  = signAccessToken({ id: user.id, role: user.role })
      const refreshToken = signRefreshToken({ id: user.id })

      return successResponse(res, {
        user: formatUser(user),
        accessToken,
        refreshToken,
      })
    } catch (err) {
      console.error('Login error:', err)
      return errorResponse(res, 'Login failed', 500)
    }
  },

  // ── Refresh token ──
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400)
      }

      const decoded = verifyRefreshToken(refreshToken)
      const user    = await userModel.findById(decoded.id)

      if (!user) {
        return errorResponse(res, 'User not found', 401)
      }

      const newAccessToken  = signAccessToken({ id: user.id, role: user.role })
      const newRefreshToken = signRefreshToken({ id: user.id })

      return successResponse(res, {
        accessToken:  newAccessToken,
        refreshToken: newRefreshToken,
      })
    } catch (err) {
      return errorResponse(res, 'Invalid or expired refresh token', 401)
    }
  },

  // ── Me ──
  async me(req, res) {
    try {
      return successResponse(res, { user: formatUser(req.user) })
    } catch (err) {
      return errorResponse(res, 'Failed to fetch user', 500)
    }
  },

  // ── Logout ──
  async logout(req, res) {
    return successResponse(res, { message: 'Logged out successfully' })
  },
}