import { Schema, model } from "mongoose";
import { ROLES, type Role } from "../types";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Never returned by default; auth code opts in with .select("+passwordHash").
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
