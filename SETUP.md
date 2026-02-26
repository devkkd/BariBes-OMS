# 🚀 Quick Setup Guide

## Step 1: Start Development Server

```bash
cd my-app
npm run dev
```

Server will start at: http://localhost:3000

## Step 2: Login

You'll be automatically redirected to the login page.

### Demo Credentials:

**Admin Account (Full Access):**
- Email: `admin@example.com`
- Password: `admin123`

**User Account (Limited Access):**
- Email: `user@example.com`
- Password: `user123`

## Step 3: Explore Dashboard

After login, you'll see:

### Admin Users Can Access:
- 📊 Dashboard - Overview with stats and activity
- 📈 Analytics - Data visualization
- 👥 Users - User management (Admin only)
- ⚙️ Settings - Application settings
- 📄 Reports - Generate reports (Admin only)

### Regular Users Can Access:
- 📊 Dashboard - Overview with stats
- 📈 Analytics - Data visualization
- ⚙️ Settings - Application settings

## 🎨 Color Scheme

The dashboard uses `#975a20` (bronze/brown) as the primary color throughout the interface.

## 🔐 Security Features Implemented

✅ Password hashing with bcrypt
✅ JWT token authentication
✅ HTTP-only cookies
✅ Role-based access control
✅ Protected routes via middleware
✅ Activity logging
✅ Automatic token expiration (24 hours)

## 📝 Next Steps for Production

1. **Update JWT Secret** in `.env.local`
2. **Replace Mock Users** with real database (PostgreSQL/MongoDB)
3. **Add Email Verification**
4. **Implement Password Reset**
5. **Add Rate Limiting** for login attempts
6. **Setup Error Monitoring** (Sentry)
7. **Configure Production Database**
8. **Enable HTTPS** in production

## 🛠️ Generate New Password Hashes

To create new users with hashed passwords:

```bash
node scripts/hash-password.js yourpassword
```

Copy the generated hash and add to your user database.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

**Issue: Can't login**
- Check console for errors
- Verify credentials are correct
- Clear browser cookies and try again

**Issue: Redirected to login after successful login**
- Check JWT_SECRET is set in .env.local
- Verify cookies are enabled in browser

**Issue: Can't access admin pages**
- Make sure you're logged in as admin@example.com
- Regular users don't have access to admin pages

## 📞 Support

For issues or questions, check the main README.md file.

---

Happy coding! 🎉
