# Task Management System - Backend

A robust Express.js backend API for a Task Management System with user authentication, role-based access control, and comprehensive task management functionality.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Features

- **User Authentication & Authorization**
  - User registration and login with JWT tokens
  - Role-based access control (Admin, User)
  - Secure password hashing

- **Task Management**
  - Create, read, update, and delete tasks
  - Task priorities (Low, Medium, High)
  - Task statuses (Open, In Progress, Testing, Done)
  - Task assignment to users
  - Due date management

- **Advanced Filtering & Search**
  - Search tasks by title and description
  - Filter by priority, status, and assignee
  - Pagination support

- **User Management**
  - View all users (Admin only)
  - User role assignment
  - Task ownership tracking

- **Analytics**
  - Task statistics (total, open, active, done)
  - Monthly velocity tracking
  - Delivery rate calculations

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs
- **Environment Management:** dotenv
- **HTTP Server:** Built-in with Express

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance - MongoDB Atlas)
- Git

## Installation

1. **Clone the repository** (if not already cloned)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install optional dependencies for development**
   ```bash
   npm install --save-dev nodemon
   ```

## Configuration

1. **Create a `.env` file in the backend root directory:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables in `.env`:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/task-management
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your_secret_key_here_change_this_in_production

   # CORS Configuration (if needed)
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Update the secret key for production:**
   - Generate a strong secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Replace `JWT_SECRET` with the generated value

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database (optional)
```bash
npm run seed
```

The server will start on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user and get JWT token

### Task Routes (`/tasks`)

- `GET /tasks` - Get all tasks (with filters)
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/analytics` - Get analytics data

### User Routes (`/users`)

- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user details

## Database Setup

### MongoDB Local Setup

1. **Install MongoDB:**
   - Follow the official MongoDB installation guide for your OS
   - Start MongoDB service

2. **Create Database:**
   ```bash
   mongosh
   use task-management
   ```

### MongoDB Atlas Setup (Recommended)

1. **Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

2. **Get connection string:**
   - Go to Databases > Connect > Connect your application
   - Copy the connection string

3. **Add to `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/task-management?retryWrites=true&w=majority
   ```

### Database Models

- **User** - Stores user authentication and profile data
- **Task** - Stores task information with creator and assignee references

## Project Structure

```
backend/
├── controllers/        # Route handlers
│   ├── auth-controller.js
│   ├── task-controller.js
│   └── user-controller.js
├── helpers/            # Middleware and utilities
│   ├── auth-middleware.js
│   └── validation.js
├── models/             # Database schemas
│   ├── Task.js
│   └── User.js
├── routes/             # API routes
│   ├── auth-routes.js
│   ├── task-routes.js
│   └── user-routes.js
├── scripts/            # Utility scripts
│   ├── seed.js         # Database seeding
│   └── test-api.js     # API testing
├── server.js           # Main application file
├── package.json
├── .env               # Environment variables
└── README.md
```

## Common Issues & Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database credentials if using MongoDB Atlas
- Check firewall settings

### JWT Token Errors
- Ensure `JWT_SECRET` is set in `.env`
- Token might be expired - user needs to login again
- Check token format in Authorization header: `Bearer <token>`

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Check that CORS middleware is configured in `server.js`

## Testing the API

### Using cURL
```bash
# Register user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123","role":"User"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get tasks (with token)
curl -X GET http://localhost:5000/tasks \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Import the API collection
2. Set environment variables for `BASE_URL` and `TOKEN`
3. Test each endpoint

## Performance Tips

- Implement database indexing on frequently queried fields
- Use pagination for large datasets
- Cache frequently accessed data
- Monitor database query performance
- Use connection pooling

## Security Considerations

- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement proper error handling without exposing sensitive info

## Support & Documentation

For additional help:
- Check Express.js documentation: https://expressjs.com
- MongoDB documentation: https://docs.mongodb.com
- JWT documentation: https://jwt.io

## License

This project is part of a task management system assignment.
