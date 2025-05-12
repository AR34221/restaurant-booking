module.exports = function ensureAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
};
