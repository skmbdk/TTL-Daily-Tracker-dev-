export const blockReadOnlyMutations = (req, res, next) => {
  if (req.user?.read_only && req.method !== 'GET') {
    return res.status(403).json({ message: 'Presenter mode is read-only.' });
  }

  return next();
};
