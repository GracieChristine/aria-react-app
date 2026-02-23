import { userModel }                          from '../models/userModel.js';
import { successResponse, errorResponse }     from '../utils/response.js';

export const userController = {

  // ── PATCH /api/users/me/become-host ──
  async becomeHost(req, res) {
    try {
      if (req.user.role !== 'guest') {
        return errorResponse(res, 'Only guests can become hosts', 403);
      }

      const user = await userModel.update(req.user.id, { role: 'host' });

      return successResponse(res, { user });
    } catch (err) {
      return errorResponse(res, 'Failed to update role', 500);
    }
  },
};