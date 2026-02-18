import { verifyAccessToken } from '../utils/jwt.js'
import { userModel } from '../models/userModel.js'
import { errorResponse } from '../utils/response.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)
    const user = await userModel.findById(decoded.id)

    if (!user) {
      return errorResponse(res, 'User not found', 401)
    }

    req.user = user
    next()
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401)
  }
}