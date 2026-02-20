export const successResponse = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, ...data });

export const errorResponse = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, error: message });