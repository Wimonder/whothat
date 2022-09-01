import { User } from "@prisma/client";
import { hashPassword } from "../../crypto/hash";
import { createJWT } from "../../crypto/jwt";
import { privateKey } from "../../keys";
import prisma from "../../utils/prisma";
import { CreateUserInput } from "./auth-schema";

export async function createUser(input: CreateUserInput) {
  const { password, ...rest } = input;

  const { hash, salt } = hashPassword(password);

  const user = await prisma.user.create({
    data: { ...rest, password: hash, salt },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function findUsers() {
  return await prisma.user.findMany({
    select: {
      email: true,
      username: true,
      id: true,
    },
  });
}

export async function generateTokens(user: User) {
  // Create valid session
  const session = await prisma.session.create({
    data: { userId: user.id, valid: true },
  });
  // Create access token
  const accessToken = await createJWT({
    data: {
      email: user.email,
      username: user.username,
      sessionId: session.id,
      userId: user.id,
    },
    privateKey,
    options: { expiresIn: 60 * 60 },
  });
  // Create refresh token
  const refreshToken = await createJWT({
    data: {
      sessionId: session.id,
    },
    privateKey,
    options: { expiresIn: 60 * 60 * 24 },
  });

  return { accessToken, refreshToken };
}

export async function invalidateSession(sessionId: number) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  });
}
