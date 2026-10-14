import bcrypt from "bcryptjs";
import { User, type IUser } from "../models/User";
import type { LoginInput, SignupInput } from "../schemas/auth.schema";
import type { Role } from "../types";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";

const SALT_ROUNDS = 10;
// Compared against when the email is unknown, so "no such user" and "wrong password" take similar time.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export function toPublicUser(user: IUser & { id: string }): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  if (await User.exists({ email: input.email })) {
    throw AppError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  // A concurrent signup with the same email is caught by the unique index (-> 409 in the error handler).
  const user = await User.create({ name: input.name, email: input.email, passwordHash, role: input.role });

  return { user: toPublicUser(user), token: signToken({ id: user.id, role: user.role }) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const passwordOk = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk) {
    throw AppError.unauthorized("Invalid email or password");
  }

  return { user: toPublicUser(user), token: signToken({ id: user.id, role: user.role }) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound("User no longer exists");
  return toPublicUser(user);
}