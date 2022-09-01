/*
JSON Web Tokens consist of three parts xxxxx.yyyyy.zzzzz:
* Header: Type of token and signature algorithm
{
  "alg": "HS256",
  "typ": "JWT"
}
Then, this JSON is Base64Url encoded to form the first part of the JWT.
* Payload
The second part of the token is the payload, which contains the claims (registered, public, private).
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true
}
The payload is then Base64Url encoded to form the second part of the JWT.
* Signature
To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.
*/

import crypto from "crypto";

export type PublicKey = crypto.KeyObject;
export type PrivateKey = crypto.KeyObject;

export interface Keypair {
  privateKey: PrivateKey;
  publicKey: PublicKey;
}
export interface SignOptions {
  expiresIn?: number; // milliseconds
  expiresAt?: number; // milliseconds
}

const defaultSignOptions = {
  expiresIn: 1000 * 60 * 60 * 24, // 1 days
};

export type Claims = object & {
  iss: string;
  exp: number;
  sub?: string;
  aud?: string;
};

export interface SignInput {
  data: object;
  privateKey: PrivateKey;
  options?: SignOptions;
}

export type JWT = string;

const dateInPast = function ({ exp }: { exp: number }) {
  const currentDate = new Date();
  return currentDate.getTime() >= exp * 1000;
};

function createSignature(data: string, key: PrivateKey) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  return signer.sign(key, "base64url");
}

export async function createJWT({ data, privateKey, options = {} }: SignInput) {
  const finalOptions = { ...defaultSignOptions, ...options };
  const expiry = finalOptions.expiresAt || Date.now() + finalOptions.expiresIn;

  const encodedHeader = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString(
    "base64url",
  );
  const encodedData = Buffer.from(JSON.stringify({ ...data, exp: expiry })).toString("base64url");
  const signature = createSignature(`${encodedHeader}.${encodedData}`, privateKey);

  return `${encodedHeader}.${encodedData}.${signature}`;
}

export async function verifyAndDecode(token: JWT, publicKey: PublicKey) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [encodedHeader, encodedData, signature] = parts;
  if (
    !crypto
      .createVerify("RSA-SHA256")
      .update(`${encodedHeader}.${encodedData}`)
      .verify(publicKey, signature, "base64url")
  ) {
    throw new Error("Invalid signature");
  }

  const decodedData = JSON.parse(Buffer.from(encodedData, "base64url").toString("utf8")) as Claims;
  if (dateInPast(decodedData)) {
    throw new Error("Token expired");
  }

  return decodedData;
}
