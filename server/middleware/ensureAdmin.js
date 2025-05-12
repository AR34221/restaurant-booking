// server/middleware/ensureAdmin.js
module.exports = function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Доступ запрещён');
};
// server/middleware/ensureAdmin.js
module.exports = function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).send('Доступ запрещён');
};
