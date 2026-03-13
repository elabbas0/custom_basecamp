const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const sequelize = require('../db/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Attachment = require('./models/Attachment');
const Thread = require('./models/Thread');
const Message = require('./models/Message');

// Associations
Project.hasMany(Attachment, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Attachment.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Attachment, { foreignKey: 'userId' });
Attachment.belongsTo(User, { foreignKey: 'userId' });

Project.hasMany(Thread, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Thread.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Thread, { foreignKey: 'userId' });
Thread.belongsTo(User, { foreignKey: 'userId' });

Thread.hasMany(Message, { foreignKey: 'threadId', onDelete: 'CASCADE' });
Message.belongsTo(Thread, { foreignKey: 'threadId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

const app = express();

// Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session
app.use(session({
  secret: 'basecamp-secret',
  resave: false,
  saveUninitialized: false
}));

// Make currentUser available to all views
app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  if (req.session.userId) {
    res.locals.currentUser = await User.findByPk(req.session.userId);
  }
  req.currentUser = res.locals.currentUser;
  next();
});

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// Routes
app.use('/users', require('./routes/userRoutes'));
app.use('/session', require('./routes/sessionRoutes'));
app.use('/projects', require('./routes/projectRoutes'));
app.use('/projects/:projectId/attachments', require('./routes/attachmentRoutes'));
app.use('/projects/:projectId/threads', require('./routes/threadRoutes'));

// WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Each client registers with their userId
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'register') {
      ws.userId = msg.userId;
    }
  });
});

// Broadcast to all connected clients who are members of a project
app.broadcast = (projectMembers, payload) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && projectMembers.includes(client.userId)) {
      client.send(JSON.stringify(payload));
    }
  });
};

// Seed default admin user if not exists
async function seedAdmin() {
  const existing = await User.findByEmail('admin@admin.com');
  if (!existing) {
    const admin = await User.createUser({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
    });
    await User.setAdmin(admin.id);
    console.log('✅ Default admin created: admin@admin.com / admin123');
  }
}

// Start server — sync DB first, then listen
sequelize.sync({ alter: true }).then(async () => {
  console.log('✅ Database synced');
  await seedAdmin();
  server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
});