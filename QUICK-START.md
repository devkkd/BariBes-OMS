# 🚀 Quick Start Guide - MongoDB Atlas Integration

## What's New?

✅ MongoDB Atlas database integration
✅ Mongoose models for User and ActivityLog
✅ Real database instead of mock data
✅ Activity logging in database
✅ User management API endpoints

## Quick Setup (5 Minutes)

### 1. Get MongoDB Atlas Connection String

Go to https://www.mongodb.com/cloud/atlas and:
1. Create free account
2. Create cluster (FREE tier)
3. Create database user
4. Whitelist IP (Allow from Anywhere for dev)
5. Get connection string

### 2. Update .env.local

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dashboard?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your values.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Create Initial Admin User

Open browser and go to:
```
http://localhost:3000/api/auth/setup
```

This creates:
- Email: `admin@example.com`
- Password: `admin123`

### 5. Login

Go to http://localhost:3000 and login!

## File Structure

```
my-app/
├── src/
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── ActivityLog.js       # Activity log model
│   ├── lib/
│   │   ├── mongodb.js           # MongoDB connection
│   │   └── auth.js              # Auth functions (updated)
│   └── app/
│       └── api/
│           ├── auth/
│           │   ├── login/       # Login endpoint
│           │   ├── logout/      # Logout endpoint
│           │   ├── me/          # Current user
│           │   └── setup/       # Initial setup
│           └── users/           # User management
└── .env.local                   # Environment variables
```

## Database Collections

### users
- Stores all user accounts
- Password hashed with bcrypt
- Roles: admin, user
- Status: active, inactive, suspended

### activitylogs
- Tracks all user actions
- Login/logout events
- Timestamps and IP addresses

## API Endpoints

### Setup
```bash
POST /api/auth/setup
# Creates initial admin user (run once)
```

### Authentication
```bash
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "admin123" }

POST /api/auth/logout

GET /api/auth/me
```

### Users (Admin Only)
```bash
GET /api/users
# Get all users

POST /api/users
Body: { "name": "John", "email": "john@example.com", "password": "pass123", "role": "user" }
```

## Testing

### 1. Test Database Connection
```bash
npm run dev
```
Check console for: "✅ MongoDB Connected Successfully"

### 2. Create Admin User
```bash
curl -X POST http://localhost:3000/api/auth/setup
```

### 3. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 4. View Users (Admin)
Login first, then:
```bash
curl http://localhost:3000/api/users
```

## Features

✅ **Real Database**: MongoDB Atlas cloud database
✅ **User Management**: Create, read users
✅ **Activity Logging**: All actions logged to database
✅ **Secure**: Passwords hashed, JWT tokens
✅ **Role-Based**: Admin and user roles
✅ **Production Ready**: Scalable architecture

## Common Issues

**"MONGODB_URI not defined"**
- Add MONGODB_URI to .env.local

**"Connection failed"**
- Check MongoDB Atlas IP whitelist
- Verify username/password in connection string

**"Admin already exists"**
- Admin user already created, just login

**Can't login**
- Run setup endpoint first
- Check MongoDB connection
- Verify credentials

## Next Steps

1. ✅ Setup MongoDB Atlas
2. ✅ Update .env.local
3. ✅ Create admin user
4. ✅ Test login
5. 🎯 Start building features!

## Full Documentation

- `MONGODB-SETUP.md` - Detailed MongoDB setup
- `README.md` - Project overview
- `FEATURES.md` - Feature documentation

---

Happy coding! 🎉
