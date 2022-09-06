import { FastifyReply, FastifyRequest } from "fastify";
import { hashPassword, verifyPassword } from "../../crypto/hash";
import { verifyAndDecode } from "../../crypto/jwt";
import {
  ApplicationParams,
  CreateApplicationInput,
  CreateUserInput,
  LoginInput,
  TokenInput,
} from "./auth-schema";
import {
  createApplication,
  createUser,
  findApplication,
  findSessionUser,
  findUserByEmail,
  generateTokens,
  invalidateSession,
  isValidSession,
  readPublicKey,
} from "./auth-service";

export async function createApplicationHandler(
  req: FastifyRequest<{
    Body: CreateApplicationInput;
  }>,
  reply: FastifyReply,
) {
  const body = req.body;
  try {
    const application = await createApplication(body);
    return reply.code(201).send(application);
  } catch (err) {
    console.log(err);
    return reply.code(500).send(err);
  }
}

export async function getApplicationPublicKeyHandler(
  req: FastifyRequest<{
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  try {
    const publicKey = await readPublicKey(parseInt(applicationId));
    return reply.code(200).send(publicKey.export({ type: "pkcs1", format: "pem" }));
  } catch (err) {
    console.log(err);
    return reply.code(500).send(err);
  }
}

export async function getApplicationHandler(
  req: FastifyRequest<{
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  try {
    const application = await findApplication(parseInt(applicationId));
    return reply.code(200).send(application);
  } catch (err) {
    console.log(err);
    return reply.code(500).send(err);
  }
}

export async function registerUserHandler(
  req: FastifyRequest<{
    Body: CreateUserInput;
    Params: {
      applicationId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  const body = req.body;

  try {
    const user = await createUser(body, parseInt(applicationId));
    reply.code(201).send(user);
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
}

export async function loginHandler(
  req: FastifyRequest<{
    Body: LoginInput;
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  const body = req.body;

  const user = await findUserByEmail(body.email, parseInt(applicationId));

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
    const tokens = await generateTokens(user, parseInt(applicationId));
    // Send response
    return reply.code(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  return reply.code(401).send({
    error: "Invalid email or password",
  });
}

export async function refreshHandler(
  req: FastifyRequest<{
    Body: TokenInput;
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  // Validate current refresh token and generate new access and refresh token
  const oldTokens = req.body;
  const refreshToken = oldTokens.refreshToken;
  if (!refreshToken) {
    return reply.code(400).send({
      msg: "No refresh token provided",
    });
  }
  // Decode and authenticate the refresh token
  let tokenData;
  try {
    tokenData = await verifyAndDecode(refreshToken, await readPublicKey(parseInt(applicationId)));
  } catch (err) {
    return reply.code(401).send({
      msg: "Invalid refresh token",
    });
  }
  // Verify that the session is valid
  const isValid = await isValidSession(tokenData.sessionId, parseInt(applicationId));
  if (!isValid) {
    return reply.code(400).send({
      msg: "Invalid refresh token",
    });
  }
  // Generate new access and refresh token
  // Fetch the user corresponding to the session
  const user = await findSessionUser(tokenData.sessionId, parseInt(applicationId));
  const tokens = await generateTokens(user, parseInt(applicationId));
  return reply.code(200).send({
    accessToken: tokens.accessToken,
    refresToke: tokens.refreshToken,
  });
}

export async function logoutHandler(
  req: FastifyRequest<{
    Body: TokenInput;
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  // Read session id
  const tokens = req.body;
  const accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  if (!refreshToken || !accessToken) {
    return reply.code(200).send({
      msg: "Logged out",
    });
  }
  // Verify access and decode token
  let tokenData;
  try {
    tokenData = await verifyAndDecode(accessToken, await readPublicKey(parseInt(applicationId)));
  } catch {
    return reply.code(200).send({
      msg: "Logged out",
    });
  }
  // Delete the session
  invalidateSession(tokenData.sessionId);
  return reply.send({
    msg: "Logged out",
  });
}

export async function getSessionHandler(
  req: FastifyRequest<{
    Querystring: TokenInput;
    Params: ApplicationParams;
  }>,
  reply: FastifyReply,
) {
  const { applicationId } = req.params;
  const tokens = req.query;
  const accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;
  if (!accessToken || !refreshToken) {
    return reply.code(200).send({
      msg: "No session found",
    });
  }
  // Verify and decode token
  try {
    const tokenData = await verifyAndDecode(
      accessToken,
      await readPublicKey(parseInt(applicationId)),
    );
    // Check if token session is valid
    const validSession = await isValidSession(
      parseInt(tokenData.sessionId),
      parseInt(applicationId),
    );
    if (!validSession) {
      return reply.code(200).send({
        msg: "No session found",
      });
    }
    // Return token information
    return reply.code(200).send({
      id: String(tokenData.sessionId),
      email: tokenData.email,
      username: tokenData.username,
    });
  } catch (err) {
    return reply.code(200).send({
      msg: "No session found",
    });
  }
}
