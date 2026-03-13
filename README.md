# Welcome to MyBaseCamp
***

## Task
MyBaseCamp is a web-based project management tool inspired by Basecamp. It allows users to register, log in, manage their accounts, and collaborate through shared projects — all within a clean MVC-structured web application.

## Description
MyBaseCamp is built with **Node.js** and **Express** on the backend, using **EJS** as the templating engine for server-rendered views. Data is persisted in a **SQLite** database managed through **Sequelize ORM**, which handles schema creation, migrations, and all database interactions. Passwords are securely hashed using **bcrypt**, and user sessions are managed with **express-session**.

The application follows a strict **MVC architecture**:
- **Models** — `User` and `Project` are defined as Sequelize models with typed columns and built-in validation
- **Views** — EJS templates organized by resource (`users/`, `projects/`, `sessions/`)
- **Controllers** — separate controller files handle all business logic per resource
- **Routes** — clean RESTful routing with role-based middleware protection

Key features include user registration and authentication, admin role management (promote/demote users), and full CRUD for projects with owner-based access control.

## Installation
```bash
# Clone the repository
git clone <repo-url>
cd my_basecamp_1/server

# Install dependencies
npm install
```

Make sure you have **Node.js v18+** installed. No external database setup is required — SQLite is file-based and created automatically on first run.

## Usage
```bash
# Start the server
npm start
# or
node app.js
```

The server runs on **http://localhost:3000**.

On first boot, a default admin account is created automatically:
- **Email:** admin@admin.com
- **Password:** admin123

From there you can register new users, manage roles from the admin panel, and create or manage projects. Only project owners (or admins) can edit or delete a project. Passwords must be at least 6 characters long.


### The Core Team
Elabbas Abdullayev
<span><i>Made at <a href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>
<span><img alt='Qwasar SV -- Software Engineering School's Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' /></span>
