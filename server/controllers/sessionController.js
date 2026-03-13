const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.loginForm = (req, res) => {
  res.render('sessions/login', { error: null });
};

exports.signIn = async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (!user) return res.render('sessions/login', { error: 'Invalid email or password' });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.render('sessions/login', { error: 'Invalid email or password' });

  req.session.userId = user.id;
  res.redirect(`/users/${user.id}`);
};

exports.signOut = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
