import { Storage } from "@google-cloud/storage";
import { User } from "@prisma/client";
import crypto, { generateKeyPairSync } from "crypto";
import { hashPassword } from "../../crypto/hash";
import { createJWT } from "../../crypto/jwt";
import { createBucketName } from "../../utils/bucket";
import prisma from "../../utils/prisma";
import { CreateApplicationInput, CreateUserInput } from "./auth-schema";

export async function createApplication(input: CreateApplicationInput) {
  const { name } = input;
  // Create keypair for the application
  const keypair = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  // Create the application
  const application = await prisma.application.create({
    data: {
      name,
    },
  });
  try {
    // Upload keypair to Google Cloud Storage
    const storage = new Storage({ keyFilename: "credentials.json" });
    const bucketName = createBucketName(name, application.id);
    const fileName = "jwt.key";
    await storage.createBucket(bucketName);
    // Save private key
    await storage.bucket(bucketName).file(fileName).save(keypair.privateKey);
    // Save public key
    await storage.bucket(bucketName).file(`${fileName}.pub`).save(keypair.publicKey);
  } catch (err) {
    console.log(err);
    await prisma.application.delete({
      where: {
        id: application.id,
      },
    });
    throw err;
  }

  return application;
}

export async function findApplication(applicationId: number) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
    },
  });

  return application;
}

export async function createUser(input: CreateUserInput, applicationId: number) {
  const { password, ...rest } = input;

  const { hash, salt } = hashPassword(password);

  const user = await prisma.user.create({
    data: { ...rest, password: hash, salt, application: { connect: { id: applicationId } } },
  });

  return user;
}

export async function findUserByEmail(email: string, applicationId: number) {
  return await prisma.user.findFirst({
    where: { email, applicationId },
  });
}

export async function findUserById(id: number, applicationId: number) {
  return await prisma.user.findFirst({
    where: { id, applicationId },
  });
}

export async function findUsers(applicationId: number) {
  return await prisma.user.findMany({
    where: { application: { id: applicationId } },
    select: {
      email: true,
      username: true,
      id: true,
    },
  });
}

export async function generateTokens(user: User, applicationId: number) {
  // Check if a valid session exists already
  let session = await prisma.session.findFirst({
    where: { userId: user.id, valid: true },
  });
  if (!session) {
    // Create new session
    session = await prisma.session.create({
      data: { userId: user.id, valid: true, applicationId },
    });
  }
  const privateKey = await readPrivateKey(applicationId);
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

export async function findSessionUser(sessionId: number, applicationId: number) {
  const session = await prisma.session.findFirstOrThrow({
    where: { id: sessionId, applicationId },
  });
  return await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
  });
}

export async function invalidateSession(sessionId: number) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  });
}

export async function isValidSession(sessionId: number, applicationId: number) {
  return (
    (await prisma.session.count({
      where: { id: sessionId, valid: true, applicationId },
    })) > 0
  );
}

export async function readPublicKey(applicationId: number) {
  // Read application name
  const application = await prisma.application.findFirstOrThrow({
    where: { id: applicationId },
  });
  const name = application?.name;

  const storage = new Storage({ keyFilename: "credentials.json" });
  const bucketName = createBucketName(name, applicationId);
  const publicKey = await (
    await storage.bucket(bucketName).file("jwt.key.pub").download()
  ).toString();
  return crypto.createPublicKey(publicKey);
}

export async function readPrivateKey(applicationId: number) {
  // Read application name
  const application = await prisma.application.findFirstOrThrow({
    where: { id: applicationId },
  });
  const name = application?.name;

  const storage = new Storage({ keyFilename: "credentials.json" });
  const bucketName = createBucketName(name, applicationId);
  const privateKey = await (await storage.bucket(bucketName).file("jwt.key").download()).toString();
  return crypto.createPrivateKey(privateKey);
}
