import { Schema, model } from "mongoose";

export enum Role {
  Admin = "Admin",
  Teacher = "Teacher",
  Student = "Student",
}

interface IUser {
  name: string;
  surname: string;
  password: string;
  role: Role;
  studentNumber?: string; // Assuming this is optional
  isVerified: boolean; // Track whether the email is verified
  verificationToken?: string; // Token for email verification
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Role },
  studentNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Add sparse index to prevent unique constraint issues with null/undefined values
  }, // Optional uniqueness
  isVerified: { type: Boolean, default: false }, // New field for verification status
  verificationToken: { type: String, required: false }, // New field for verification token
});

export const User = model<IUser>("User", UserSchema);
