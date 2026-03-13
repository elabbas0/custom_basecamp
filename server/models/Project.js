const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  owner: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  members: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      return JSON.parse(this.getDataValue('members') || '[]');
    },
    set(val) {
      this.setDataValue('members', JSON.stringify(val));
    },
  },
}, {
  tableName: 'projects',
});

// Static helpers to preserve the same interface used by controllers

Project.createProject = async (data) => {
  return Project.create({
    name: data.name,
    description: data.description || '',
    owner: data.owner,
    members: data.members || [],
  });
};

Project.getAllProjects = async () => {
  return Project.findAll();
};

Project.updateProject = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  project.name = data.name;
  project.description = data.description;
  await project.save();
  return project;
};

Project.deleteProject = async (id) => {
  const project = await Project.findByPk(id);
  if (project) await project.destroy();
};

module.exports = Project;
