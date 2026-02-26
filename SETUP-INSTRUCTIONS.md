# 🚀 Complete Setup Instructions

## Prerequisites

- Node.js installed
- MongoDB Atlas account (free tier)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd my-app
npm install
```

### 2. Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create FREE cluster
3. Create database user (save username & password)
4. Whitelist IP: "Allow Access from Anywhere" (for development)
5. Get connection string

### 3. Configure Environment Variables

Create/Update `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NEXT_PUBLIC_APP_NAME=Dashboard App
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/dashboard?retryWrites=true&w=majority
```

**Replace:**
- `YOUR_USERNAME` with your MongoDB username
- `YOUR_PASSWORD` with your MongoDB password
- `YOUR_CLUSTER` with your cluster name

### 4. Seed Database (Create Admin User)

```bash
npm run seed
```

**This creates:**
- Email: `admin@baribes.com`
- Password: `BariBes@123`
- Role: Admin

### 5. Start Development Server

```bash
npm run dev
```

### 6. Login

1. Open http://localhost:3000
2. Login with:
   - Email: `admin@baribes.com`
   - Password: `BariBes@123`

## 🎉 You're Done!

Your dashboard is now running with:
- ✅ MongoDB Atlas database
- ✅ Admin user created
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Activity logging

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Seed database with admin user
```

## Admin Credentials

**Email:** admin@baribes.com  
**Password:** BariBes@123

⚠️ **Important:** Change the password after first login!

## Project Structure

```
my-app/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── login/        # Login page
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   │   ├── auth.js       # Authentication
│   │   └── mongodb.js    # Database connection
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   └── ActivityLog.js
│   └── scripts/          # Utility scripts
│       └── seed.js       # Database seeding
├── public/               # Static files
│   ├── BB-logo.png       # Your logo
│   └── login-image.png   # Login background
└── .env.local           # Environment variables
```

## Features

✅ Secure authentication (JWT + bcrypt)
✅ MongoDB Atlas integration
✅ Role-based access control (Admin/User)
✅ Activity logging
✅ User management
✅ Responsive design
✅ Production-ready

## Troubleshooting

### Can't connect to MongoDB?
- Check MONGODB_URI in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Ensure cluster is running

### Seed script fails?
- Check MongoDB connection
- Verify `.env.local` exists
- Run `npm install` again

### Can't login?
- Run seed script: `npm run seed`
- Clear browser cookies
- Check console for errors

## Documentation

- `SEED-GUIDE.md` - Database seeding guide
- `MONGODB-SETUP.md` - Detailed MongoDB setup
- `QUICK-START.md` - Quick start guide
- `IMAGE-SETUP-GUIDE.md` - Login image setup

## Next Steps

1. Change admin password
2. Create additional users
3. Customize dashboard
4. Add your branding
5. Deploy to production

## Support

For issues or questions:
1. Check documentation files
2. Review console logs
3. Verify MongoDB connection
4. Check `.env.local` configuration

---

Happy coding! 🎉
