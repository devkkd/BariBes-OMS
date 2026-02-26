# Production-Level Dashboard Application

A secure, production-ready dashboard application built with Next.js 14+ featuring JWT authentication, role-based access control, and a beautiful UI with #975a20 color scheme.

## 🔐 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and User roles with protected routes
- **Protected Routes**: Middleware-based route protection
- **Activity Logging**: Track user actions and security events
- **HTTP-Only Cookies**: Secure token storage

## 🎨 Features

- Modern, responsive dashboard layout
- Header and sidebar navigation
- Role-based menu items
- Beautiful UI with #975a20 color scheme
- Real-time activity monitoring
- Analytics and reporting (admin only)
- User management (admin only)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd my-app
npm install
```

### 2. Configure Environment

Update `.env.local` with a secure JWT secret:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to the login page.

## 👤 Demo Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `admin123`
- Access: Full system access including user management and reports

### User Account
- Email: `user@example.com`
- Password: `user123`
- Access: Limited to dashboard, analytics, and settings

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── api/auth/          # Authentication API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   └── page.js            # Home (redirects to login)
│   ├── components/
│   │   ├── Header.js          # Dashboard header
│   │   └── Sidebar.js         # Navigation sidebar
│   ├── lib/
│   │   └── auth.js            # Authentication utilities
│   └── middleware.js          # Route protection
├── .env.local                 # Environment variables
└── package.json
```

## 🔒 Security Implementation

### Password Hashing
```javascript
// Passwords are hashed using bcrypt with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
```

### JWT Tokens
```javascript
// Tokens expire after 24 hours
const token = await new SignJWT(payload)
  .setExpirationTime('24h')
  .sign(JWT_SECRET);
```

### Protected Routes
- Middleware checks authentication on all `/dashboard/*` routes
- Role-based access control for admin-only pages
- Automatic redirect to login for unauthenticated users

### Activity Logging
All authentication events are logged:
- Login attempts (success/failure)
- Logout events
- User actions

## 🎯 Role-Based Access

### Admin Role
- Dashboard overview
- Analytics
- User management
- Settings
- Reports generation

### User Role
- Dashboard overview
- Analytics
- Settings

## 🛠️ Production Deployment

### Before Deploying:

1. **Change JWT Secret**: Generate a strong, random secret
2. **Update User Database**: Replace mock users with real database
3. **Enable HTTPS**: Ensure secure cookie transmission
4. **Configure CORS**: Set appropriate CORS policies
5. **Add Rate Limiting**: Protect against brute force attacks
6. **Setup Logging**: Implement proper logging service
7. **Database Integration**: Connect to PostgreSQL/MongoDB

### Recommended Additions:

- Email verification
- Password reset functionality
- Two-factor authentication
- Session management
- API rate limiting
- Database connection pooling
- Error monitoring (Sentry)
- Performance monitoring

## 📝 API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

## 🎨 Color Scheme

Primary Color: `#975a20` (Brown/Bronze)
- Used for buttons, highlights, and branding
- Hover state: `#7d4a1a`
- Complementary colors: White, Gray scale

## 📦 Dependencies

- Next.js 16.1.6
- React 19.2.3
- bcryptjs - Password hashing
- jose - JWT handling
- Tailwind CSS 4 - Styling

## 🔄 Next Steps

1. Replace mock user data with database
2. Add email verification
3. Implement password reset
4. Add more dashboard widgets
5. Integrate real analytics
6. Add data visualization charts
7. Implement real-time notifications

## 📄 License

This is a production-ready template. Customize as needed for your project.
