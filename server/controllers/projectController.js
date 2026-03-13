const Project = require('../models/Project');
const Attachment = require('../models/Attachment');
const Thread = require('../models/Thread');
const User = require('../models/User');

exports.index = async (req, res) => {
  const projects = await Project.getAllProjects();
  res.render('projects/index', { projects });
};

exports.newProject = (req, res) => {
  res.render('projects/new');
};

exports.create = async (req, res) => {
  const project = await Project.createProject({
    ...req.body,
    owner: req.session.userId
  });
  res.redirect(`/projects/${project.id}`);
};

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  const attachments = await Attachment.findAll({ where: { projectId: project.id } });
  const threads = await Thread.findAll({ where: { projectId: project.id } });
  const members = project.members.length > 0
    ? await User.findAll({ where: { id: project.members } })
    : [];
  const ownerUser = await User.findByPk(project.owner);
  res.render('projects/show', { project, attachments, threads, members, ownerUser, query: req.query });
};

exports.edit = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  res.render('projects/edit', { project });
};

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  await Project.updateProject(req.params.id, req.body);
  res.redirect(`/projects/${req.params.id}`);
};

exports.destroy = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  await Project.deleteProject(req.params.id);
  res.redirect('/projects');
};

exports.addMember = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const user = await User.findByEmail(req.body.email);
  if (!user) return res.redirect(`/projects/${project.id}?memberError=User+not+found`);
  if (user.id === project.owner) return res.redirect(`/projects/${project.id}?memberError=User+is+already+the+owner`);
  if (project.members.includes(user.id)) return res.redirect(`/projects/${project.id}?memberError=User+is+already+a+member`);

  project.members = [...project.members, user.id];
  await project.save();
  res.redirect(`/projects/${project.id}`);
};

exports.removeMember = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (project.owner !== req.currentUser.id && req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  project.members = project.members.filter(id => id !== req.params.userId);
  await project.save();
  res.redirect(`/projects/${project.id}`);
};