import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role_name,
      session_mode: user.session_mode || 'standard',
      read_only: Boolean(user.read_only),
      session_id: user.session_id
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};
