const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    req.user = jwt.verify(token, config.get('jwtSecret'));
    next();
  } catch {
    res.sendStatus(403);
  }
};
