// models/User.ts
import mongoose from 'mongoose';

// Define schema without middleware
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required'],
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
  },
  idType: {
    type: String,
    enum: ['citizenship', 'driving_license'],
    required: [true, 'ID type is required'],
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
  },
  idPhotoPath: {
    type: String,
    required: [true, 'ID photo is required'],
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if model exists already (for Next.js hot reload)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;