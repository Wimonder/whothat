import crypto from "crypto";

export function hashPassword(password: string) {
  // Create a salt for each user
  const salt = crypto.randomBytes(16).toString("hex");

  // Create a hash of the password and the salt
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512").toString("hex");

  return { hash, salt };
}

export function verifyPassword({
  password,
  hash,
  salt,
}: {
  password: string;
  hash: string;
  salt: string;
}) {
  // Create a hash of the password and the salt
  const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512").toString("hex");

  return hash === hashVerify;
}
