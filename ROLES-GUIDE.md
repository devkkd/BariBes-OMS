# 👥 Roles & Permissions Guide

## System Roles

The system has TWO roles:

### 1. Admin (Single User)
- **Count:** Only ONE admin in the system
- **Email:** admin@baribes.com
- **Created:** Via seed script
- **Cannot be:** Created through UI or API

### 2. Staff (Multiple Users)
- **Count:** Unlimited
- **Created by:** Admin only
- **Access:** Limited permissions

## Role Permissions

### Admin Can:
✅ Access all dashboard features
✅ View analytics
✅ Create staff members
✅ Manage staff members
✅ Generate reports
✅ Access settings
✅ View activity logs
✅ Full system access

### Staff Can:
✅ Access dashboard
✅ View analytics
✅ Access settings
❌ Cannot create other staff
❌ Cannot access staff management
❌ Cannot generate reports
❌ Limited system access

## Creating Staff Members

### Only Admin Can Create Staff

**Method 1: Via Dashboard (Coming Soon)**
1. Login as admin
2. Go to "Staff Management"
3. Click "Add New Staff"
4. Fill in details
5. Staff account created

**Method 2: Via API**
```bash
POST /api/users
Headers: { "Cookie": "auth-token=..." }
Body: {
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "SecurePassword123"
}
```

**Note:** Role is automatically set to "staff". Cannot create admin via API.

## Security Rules

### Admin Protection
- ✅ Only ONE admin exists
- ✅ Cannot create another admin via API
- ✅ Admin created only via seed script
- ✅ Admin cannot be deleted
- ✅ Admin role cannot be changed

### Staff Protection
- ✅ Staff can only be created by admin
- ✅ Staff cannot create other staff
- ✅ Staff cannot change their role
- ✅ Staff cannot access admin features

## Navigation Menu

### Admin Sees:
- 📊 Dashboard
- 📈 Analytics
- 👥 Staff Management
- 📄 Reports
- ⚙️ Settings

### Staff Sees:
- 📊 Dashboard
- 📈 Analytics
- ⚙️ Settings

## Database Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'admin' | 'staff',  // Only these two values
  status: 'active' | 'inactive' | 'suspended',
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Get All Staff (Admin Only)
```bash
GET /api/users
Response: {
  success: true,
  users: [...],
  stats: {
    total: 5,
    admin: 1,
    staff: 4,
    active: 5
  }
}
```

### Create Staff (Admin Only)
```bash
POST /api/users
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: {
  success: true,
  user: {
    id: "...",
    name: "John Doe",
    email: "john@example.com",
    role: "staff",
    status: "active"
  }
}
```

## Setup Instructions

### 1. Create Admin (One Time)
```bash
npm run seed
```

This creates:
- Email: admin@baribes.com
- Password: BariBes@123
- Role: admin

### 2. Login as Admin
Go to http://localhost:3000 and login

### 3. Create Staff Members
Use the Staff Management page or API

## Common Scenarios

### Scenario 1: First Time Setup
1. Run `npm run seed` to create admin
2. Login as admin
3. Create staff members as needed

### Scenario 2: Staff Login
1. Admin creates staff account
2. Staff receives credentials
3. Staff logs in with their email/password
4. Staff sees limited menu

### Scenario 3: Trying to Create Admin
```bash
POST /api/users
Body: { "role": "admin", ... }
Response: {
  error: "Cannot create another admin. Only one admin is allowed."
}
```

## Validation Rules

### Email
- Must be unique
- Must be valid email format
- Converted to lowercase

### Password
- Minimum 6 characters (recommended)
- Hashed with bcrypt
- Never stored in plain text

### Role
- Only 'admin' or 'staff'
- Default: 'staff'
- Cannot create 'admin' via API

### Status
- 'active', 'inactive', or 'suspended'
- Default: 'active'

## Troubleshooting

### "Cannot create another admin"
- This is correct behavior
- Only one admin allowed
- Use seed script for admin

### "Unauthorized"
- You're not logged in as admin
- Only admin can create staff
- Login with admin credentials

### Staff can't see Staff Management
- This is correct
- Only admin can access
- Staff has limited permissions

## Best Practices

1. ✅ Keep admin credentials secure
2. ✅ Create staff accounts as needed
3. ✅ Use strong passwords
4. ✅ Regularly review staff access
5. ✅ Deactivate unused accounts
6. ✅ Monitor activity logs
7. ✅ Change default admin password

## Future Enhancements

Possible additions:
- Staff profile management
- Password reset functionality
- Email verification
- Two-factor authentication
- Audit logs
- Role permissions customization

---

For more information, see:
- `SEED-GUIDE.md` - Admin creation
- `MONGODB-SETUP.md` - Database setup
- `SETUP-INSTRUCTIONS.md` - Complete setup
