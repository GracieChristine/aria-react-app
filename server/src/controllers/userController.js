import { userModel }                          from '../models/userModel.js';
import { successResponse, errorResponse }     from '../utils/response.js';
import { hashPassword, comparePassword }      from '../utils/password.js';

export const userController = {

  // ── GET /api/users/me ──
  async getMe(req, res) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) return errorResponse(res, 'User not found', 404);
      return successResponse(res, { user });
    } catch {
      return errorResponse(res, 'Failed to fetch profile', 500);
    }
  },

  // ── PATCH /api/users/me ──
  async updateMe(req, res) {
    try {
      const { firstName, lastName, email, bio, phone } = req.body;
      const updates = {};

      if (firstName !== undefined) updates.first_name = firstName.trim();
      if (lastName  !== undefined) updates.last_name  = lastName.trim();
      if (bio       !== undefined) updates.bio        = bio.trim();
      if (phone     !== undefined) updates.phone      = phone.trim();

      if (email !== undefined) {
        const trimmed = email.trim().toLowerCase();
        if (trimmed !== req.user.email) {
          const existing = await userModel.findByEmail(trimmed);
          if (existing) return errorResponse(res, 'Email already in use', 409);
        }
        updates.email = trimmed;
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse(res, 'No fields to update', 400);
      }

      const user = await userModel.update(req.user.id, updates);
      return successResponse(res, { user });
    } catch {
      return errorResponse(res, 'Failed to update profile', 500);
    }
  },

  // ── PATCH /api/users/me/password ──
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current and new password are required', 400);
      }
      if (newPassword.length < 8) {
        return errorResponse(res, 'New password must be at least 8 characters', 400);
      }

      const record = await userModel.findByEmail(req.user.email);
      const valid  = await comparePassword(currentPassword, record.password_hash);
      if (!valid) return errorResponse(res, 'Current password is incorrect', 401);

      const passwordHash = await hashPassword(newPassword);
      await userModel.update(req.user.id, { password_hash: passwordHash });

      return successResponse(res, { message: 'Password updated successfully' });
    } catch {
      return errorResponse(res, 'Failed to change password', 500);
    }
  },

  // ── PATCH /api/users/me/become-host ──
  async becomeHost(req, res) {
    try {
      if (req.user.role !== 'guest') {
        return errorResponse(res, 'Only guests can become hosts', 400);
      }

      const user = await userModel.update(req.user.id, { role: 'host' });

      return successResponse(res, { user });
    } catch {
      return errorResponse(res, 'Failed to update role', 500);
    }
  },
};
