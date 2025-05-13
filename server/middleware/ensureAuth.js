// server/middleware/ensureAuth.js
module.exports = function ensureAuth(req, res, next) {
  if (!req.session.user) {
    // если это AJAX / JSON-запрос к /api/…
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // иначе — обычный редирект для страниц
    return res.redirect('/login');
  }
  next();
};
