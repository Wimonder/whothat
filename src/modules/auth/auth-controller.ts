import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword, verifyPassword } from "utils/hash";
import { CreateUserInput, LoginInput } from "./auth-schema";
import { createUser, findUserByEmail } from "./auth-service";

export async function registerUserHandler(
  req: FastifyRequest<{
    Body: CreateUserInput;
  }>,
  reply: FastifyReply,
) {
  const body = req.body;

  try {
    const user = await createUser(body);
    reply.code(201).send(user);
  } catch (err) {
    console.error(err);
    reply.code(500).send(err);
  }
}

export async function loginHandler(
  req: FastifyRequest<{
    Body: LoginInput;
  }>,
  reply: FastifyReply,
) {
  const body = req.body;

  const user = await findUserByEmail(body.email);

  if (!user) {
    // Always hash the password to prevent timing attacks
    hashPassword(body.password);
    return reply.code(401).send({
      error: "Invalid email or password",
    });
  }

  // Verify password
  const isCorrectPassword = verifyPassword({
    password: body.password,
    hash: user.password,
    salt: user.salt,
  });

  if (isCorrectPassword) {
    // Generate access and refresh tokens
    const { password, salt, ...rest } = user;
    const accessToken = generateAccessToken(rest);
    const refreshToken = generateRefreshToken(rest);
    return { accessToken: accessToken, refreshToken: refreshToken };
  }

  return reply.code(401).send({
    error: "Invalid email or password",
  });
}
