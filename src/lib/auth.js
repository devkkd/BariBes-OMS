import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from './mongodb';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
);

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email, password) {
  try {
    await connectDB();
    
    const user = await User.findOne({ email, status: 'active' });
    if (!user) return null;
    
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return null;
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return { 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name, 
      role: user.role 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) return null;
  
  const payload = await verifyToken(token.value);
  return payload;
}

export async function logActivity(userId, action, details = {}) {
  try {
    await connectDB();
    
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown',
    });
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] User ${userId}: ${action}`);
  } catch (error) {
    console.error('Activity log error:', error);
  }
}

// Helper function to create initial admin user
export async function createInitialAdmin() {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }
    
    const hashedPassword = await hashPassword('admin123');
    
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });
    
    console.log('✅ Initial admin user created: admin@example.com / admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Helper function to get all users
export async function getAllUsers() {
  try {
    await connectDB();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Helper function to get user by ID
export async function getUserById(userId) {
  try {
    await connectDB();
    const user = await User.findById(userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
