# 🗄️ MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign In"
3. Create account or login

## Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Click "Create Cluster"

## Step 3: Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Whitelist IP Address

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address
4. Click "Confirm"

## Step 5: Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`

## Step 6: Update .env.local

Open `my-app/.env.local` and update:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/dashboard?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_USERNAME` - Your database username
- `YOUR_PASSWORD` - Your database password
- `YOUR_CLUSTER` - Your cluster name (e.g., cluster0.abc123)
- `dashboard` - Your database name (you can change this)

**Example:**
```env
MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/dashboard?retryWrites=true&w=majority
```

## Step 7: Install Dependencies

Already installed! ✅
- mongoose
- mongodb

## Step 8: Create Initial Admin User

After updating `.env.local`, run:

```bash
npm run dev
```

Then open your browser and go to:
```
http://localhost:3000/api/auth/setup
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/auth/setup
```

This will create the initial admin user:
- Email: `admin@example.com`
- Password: `admin123`

## Step 9: Test Login

1. Go to http://localhost:3000
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

## Database Structure

### Collections Created:

**1. users**
- name
- email (unique)
- password (hashed with bcrypt)
- role (admin/user)
- status (active/inactive/suspended)
- lastLogin
- createdAt
- updatedAt

**2. activitylogs**
- userId (reference to User)
- action
- details
- ipAddress
- userAgent
- createdAt
- updatedAt

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/setup` - Create initial admin (run once)

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

## Features Implemented

✅ MongoDB Atlas connection
✅ Mongoose models (User, ActivityLog)
✅ Password hashing with bcrypt
✅ JWT authentication
✅ Activity logging
✅ User management
✅ Role-based access control

## Troubleshooting

### Connection Error?
- Check MONGODB_URI is correct
- Verify username and password
- Check IP whitelist in Atlas
- Ensure cluster is running

### Admin user not created?
- Check MongoDB connection
- Run `/api/auth/setup` endpoint
- Check console logs for errors

### Can't login?
- Verify admin user exists in database
- Check password is correct
- Clear browser cookies
- Check console for errors

## MongoDB Atlas Dashboard

View your data:
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Select your database
4. View users and activitylogs collections

## Production Checklist

Before deploying:
- [ ] Change JWT_SECRET to strong random value
- [ ] Update MONGODB_URI with production credentials
- [ ] Restrict IP whitelist (remove "Allow from Anywhere")
- [ ] Change default admin password
- [ ] Enable MongoDB backup
- [ ] Set up monitoring alerts
- [ ] Review security settings

## Next Steps

1. Create more users via dashboard
2. Test role-based access
3. View activity logs in MongoDB
4. Customize user schema as needed
5. Add more features (password reset, email verification, etc.)

---

Need help? Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
