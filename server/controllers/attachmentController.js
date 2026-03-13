const Attachment = require('../models/Attachment');
const Project = require('../models/Project');
const path = require('path');

exports.create = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) return res.status(404).send('Project not found');

  // Check the user is a member or owner of this project
  const isMember = project.members.includes(req.currentUser.id);
  const isOwner = project.owner === req.currentUser.id;
  if (!isMember && !isOwner) return res.status(403).send('Forbidden');

  if (!req.file) return res.status(400).send('No file uploaded');

  const format = path.extname(req.file.originalname).replace('.', '').toLowerCase();
  const allowed = ['png', 'jpg', 'pdf', 'txt'];
  if (!allowed.includes(format)) return res.status(400).send('Invalid file format. Only PNG/JPG/PDF/TXT files are supported.');

  await Attachment.create({
    filename: req.file.originalname,
    storedName: req.file.filename,
    format,
    projectId: project.id,
    userId: req.currentUser.id,
  });

  res.redirect(`/projects/${project.id}`);
};

exports.destroy = async (req, res) => {
  const attachment = await Attachment.findByPk(req.params.id);
  if (!attachment) return res.status(404).send('Attachment not found');

  // Only the uploader or project owner can delete
  const project = await Project.findByPk(attachment.projectId);
  const isUploader = attachment.userId === req.currentUser.id;
  const isOwner = project.owner === req.currentUser.id;
  if (!isUploader && !isOwner) return res.status(403).send('Forbidden');

  await attachment.destroy();
  res.redirect(`/projects/${attachment.projectId}`);
};

exports.download = async (req, res) => {
  const attachment = await Attachment.findByPk(req.params.id);
  if (!attachment) return res.status(404).send('Attachment not found');

  const filePath = path.join(__dirname, '../../uploads', attachment.storedName);
  res.download(filePath, attachment.filename);
};