const User = require('../models/User');

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/session/login');
  }
  req.currentUser = await User.findByPk(req.session.userId);
  res.locals.currentUser = req.currentUser;
  next();
};
