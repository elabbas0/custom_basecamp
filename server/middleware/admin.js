const User = require('../models/User');

module.exports = async (req, res, next) => {
  const user = await User.findByPk(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};
