const Message = require('../models/Message');
const Thread = require('../models/Thread');
const Project = require('../models/Project');
const User = require('../models/User');

exports.create = async (req, res) => {
  const thread = await Thread.findByPk(req.params.threadId);
  if (!thread) return res.status(404).send('Thread not found');

  // Any project member or owner can post a message
  const project = await Project.findByPk(thread.projectId);
  const isMember = project.members.includes(req.currentUser.id);
  const isOwner = project.owner === req.currentUser.id;
  const isAdmin = req.currentUser.role === 'admin';
  if (!isMember && !isOwner && !isAdmin) return res.status(403).send('Forbidden');

  const message = await Message.create({
    body: req.body.body,
    threadId: thread.id,
    userId: req.currentUser.id,
  });

  // Load the user so we can send their name to all clients
  const user = await User.findByPk(req.currentUser.id);

  // Broadcast to owner, members, and all site admins
  const admins = await User.findAll({ where: { role: 'admin' } });
  const adminIds = admins.map(a => a.id);
  const recipients = [...new Set([...project.members, project.owner, ...adminIds])];

  req.app.broadcast(recipients, {
    type: 'new_message',
    id: message.id,
    body: message.body,
    createdAt: message.createdAt,
    userId: user.id,
    userName: user.name,
    threadId: thread.id,
    threadTitle: thread.title,
    projectId: project.id,
  });

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.edit = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).send('Message not found');
  if (message.userId !== req.currentUser.id) return res.status(403).send('Forbidden');

  const thread = await Thread.findByPk(message.threadId);
  const project = await Project.findByPk(thread.projectId);
  res.render('messages/edit', { message, thread, project });
};

exports.update = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).send('Message not found');
  if (message.userId !== req.currentUser.id) return res.status(403).send('Forbidden');

  message.body = req.body.body;
  await message.save();

  const thread = await Thread.findByPk(message.threadId);
  const project = await Project.findByPk(thread.projectId);
  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.destroy = async (req, res) => {
  const message = await Message.findByPk(req.params.id);
  if (!message) return res.status(404).send('Message not found');
  if (message.userId !== req.currentUser.id) return res.status(403).send('Forbidden'); // Make sure only the owner can delete

  const thread = await Thread.findByPk(message.threadId);
  const project = await Project.findByPk(thread.projectId);
  await message.destroy();

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};