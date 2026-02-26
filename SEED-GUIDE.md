# 🌱 Database Seed Guide

## Admin User Details

**Email:** `admin@baribes.com`  
**Password:** `BariBes@123`  
**Role:** Admin  
**Name:** BariBes Admin

## How to Seed Database

### Method 1: Using Seed Script (Recommended)

1. **Make sure MongoDB URI is set in `.env.local`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dashboard?retryWrites=true&w=majority
```

2. **Run the seed command:**
```bash
npm run seed
```

3. **Output will show:**
```
🌱 Starting database seed...
📡 Connecting to MongoDB...
✅ Connected to MongoDB
👤 Creating admin user...
✅ Admin user created successfully!
📧 Email: admin@baribes.com
🔑 Password: BariBes@123
👤 Name: BariBes Admin
🆔 ID: [user-id]

🎉 Database seeding completed!

📝 Login Credentials:
   Email: admin@baribes.com
   Password: BariBes@123
```

### Method 2: Using API Endpoint

**Note:** The `/api/auth/setup` endpoint creates a different admin user. Use the seed script for the BariBes admin.

## What the Seed Script Does

1. ✅ Connects to MongoDB Atlas
2. ✅ Checks if admin user exists
3. ✅ Creates admin user if not exists
4. ✅ Updates password if user already exists
5. ✅ Hashes password with bcrypt
6. ✅ Sets role to 'admin'
7. ✅ Sets status to 'active'

## After Seeding

### Test Login

1. Start development server:
```bash
npm run dev
```

2. Go to: http://localhost:3000

3. Login with:
   - Email: `admin@baribes.com`
   - Password: `BariBes@123`

### Verify in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. Select your database
4. Open "users" collection
5. You should see the admin user

## Re-running Seed

You can run the seed script multiple times:
- If admin exists: Updates password
- If admin doesn't exist: Creates new admin

```bash
npm run seed
```

## Troubleshooting

### "MONGODB_URI is not defined"
- Check `.env.local` file exists
- Verify MONGODB_URI is set correctly

### "Connection failed"
- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Ensure cluster is running

### "Admin already exists"
- This is normal! Script will update the password
- You can still login with the credentials

### Can't login after seeding
- Clear browser cookies
- Check MongoDB to verify user exists
- Verify password is correct: `BariBes@123`
- Check console for errors

## Seed Script Location

```
my-app/
└── src/
    └── scripts/
        └── seed.js
```

## Package.json Script

```json
{
  "scripts": {
    "seed": "node src/scripts/seed.js"
  }
}
```

## Security Notes

⚠️ **Important for Production:**
- Change the default password after first login
- Use strong, unique passwords
- Don't commit `.env.local` to git
- Rotate credentials regularly
- Enable 2FA if possible

## Next Steps

After seeding:
1. ✅ Login to dashboard
2. ✅ Change admin password
3. ✅ Create additional users
4. ✅ Test role-based access
5. ✅ Configure application settings

---

Happy coding! 🚀
