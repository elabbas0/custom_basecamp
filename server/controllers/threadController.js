const Thread = require('../models/Thread');
const Project = require('../models/Project');
const Message = require('../models/Message');
const User = require('../models/User');

exports.new = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) return res.status(404).send('Project not found');
  res.render('threads/new', { project });
};

exports.create = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) return res.status(404).send('Project not found');

  // Only the project owner or site admin can create a thread
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') return res.status(403).send('Forbidden');

  const thread = await Thread.create({
    title: req.body.title,
    projectId: project.id,
    userId: req.currentUser.id,
  });

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.show = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id, {
    include: [
      { model: Message, include: [User] },
      { model: User },
    ],
  });
  if (!thread) return res.status(404).send('Thread not found');

  const project = await Project.findByPk(thread.projectId);
  res.render('threads/show', { thread, project });
};

exports.edit = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id);
  if (!thread) return res.status(404).send('Thread not found');

  const project = await Project.findByPk(thread.projectId);
  if (project.owner !== req.currentUser.id) return res.status(403).send('Forbidden');

  res.render('threads/edit', { thread, project });
};

exports.update = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id);
  if (!thread) return res.status(404).send('Thread not found');

  const project = await Project.findByPk(thread.projectId);
  if (project.owner !== req.currentUser.id) return res.status(403).send('Forbidden');

  thread.title = req.body.title;
  await thread.save();

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.destroy = async (req, res) => {
  const thread = await Thread.findByPk(req.params.id);
  if (!thread) return res.status(404).send('Thread not found');

  const project = await Project.findByPk(thread.projectId);
  if (project.owner !== req.currentUser.id) return res.status(403).send('Forbidden');

  await thread.destroy();
  res.redirect(`/projects/${project.id}`);
};