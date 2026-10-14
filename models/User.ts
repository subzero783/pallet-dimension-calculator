import mongoose, { Schema, Document, Model } from "mongoose";
import * as argon2 from "argon2";

export type UserRole = "shipping_clerk" | "supervisor" | "admin";

export interface IUser extends Document {
  username: string;
  name: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  verifyPassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["shipping_clerk", "supervisor", "admin"],
      default: "shipping_clerk",
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password using argon2
UserSchema.methods.verifyPassword = async function (candidatePassword: string): Promise<boolean> {
  return argon2.verify(this.password, candidatePassword);
};

// Static helper to hash password
export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText);
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
