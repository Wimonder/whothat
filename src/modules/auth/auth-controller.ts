import cookie from "cookie";
import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword, verifyPassword } from "../../crypto/hash";
import { CreateUserInput, LoginInput } from "./auth-schema";
import { createUser, findUserByEmail, generateTokens } from "./auth-service";

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
    const tokens = await generateTokens(user);
    // Set tokens in cookie and send response
    return reply
      .code(200)
      .header(
        "set-cookie",
        cookie.serialize("accessToken", tokens.accessToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        }),
      )
      .header(
        "set-cookie",
        cookie.serialize("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 1000,
        }),
      );
  }

  return reply.code(401).send({
    error: "Invalid email or password",
  });
}

// export async function logoutHandler(req: FastifyRequest, reply: FastifyReply) {

//   return {};
// }

export async function getSessionHandler(req: FastifyRequest, reply: FastifyReply) {
  console.log(req.headers);
  console.log(reply);
  // invalidateSession(req.cookies.sessionId);
  return {};
}
