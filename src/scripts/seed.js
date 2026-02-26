import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.local') });

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }
    
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@baribes.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('📧 Email: admin@baribes.com');
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('BariBes@123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('🔄 Password updated to: BariBes@123');
    } else {
      // Create new admin user
      console.log('👤 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('BariBes@123', 10);
      
      const admin = await User.create({
        name: 'BariBes Admin',
        email: 'admin@baribes.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@baribes.com');
      console.log('🔑 Password: BariBes@123');
      console.log('👤 Name:', admin.name);
      console.log('🆔 ID:', admin._id.toString());
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 Login Credentials:');
    console.log('   Email: admin@baribes.com');
    console.log('   Password: BariBes@123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
