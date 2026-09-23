export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role_name)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    return next();
  };
};
