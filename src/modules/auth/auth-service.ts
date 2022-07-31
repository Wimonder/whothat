import { hashPassword } from "utils/hash";
import prisma from "utils/prisma";
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
