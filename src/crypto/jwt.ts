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
import fs from "fs";
import path from "path";

const pubKeyPath = path.resolve("../../jwt.key.pub");
const pubKeyFile = fs.readFileSync(pubKeyPath, "utf8");
const pubKey = crypto.createPublicKey(pubKeyFile);
const privateKeyPath = path.resolve("../../jwt.key");
const privateKeyFile = fs.readFileSync(privateKeyPath, "utf8");
const privateKey = crypto.createPrivateKey(privateKeyFile);

export type PublicKey = crypto.KeyObject;
export type PrivateKey = crypto.KeyObject;

export interface Keypair {
  privateKey: PrivateKey;
  publicKey: PublicKey;
}

export interface SignOptions {
  expiresIn?: number; // milliseconds
}

export interface SignInput {
  data: object;
  privateKey: PrivateKey;
  options?: SignOptions;
}

export type JWT = string;

function createSignature(data: string, key: PrivateKey) {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  return signer.sign(key, "base64url");
}

export async function createJWT({ data, privateKey, options = {} }: SignInput) {
  const expiresIn = Date.now() + (options.expiresIn || 15 * 60000);

  const encodedHeader = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString(
    "base64url",
  );
  const encodedData = Buffer.from(JSON.stringify({ ...data, exp: expiresIn })).toString(
    "base64url",
  );
  const signature = createSignature(`${encodedHeader}.${encodedData}`, privateKey);

  return `${encodedHeader}.${encodedData}.${signature}`;
}

export async function decode(token: JWT, publicKey: PublicKey) {
  let [encodedHeader, encodedData, signature] = token.split(".");

  return Buffer.from(encodedData, "base64url").toString("utf8");
}

export async function verify(token: JWT, publicKey: PublicKey) {
  let [encodedHeader, encodedData, signature] = token.split(".");

  return crypto
    .createVerify("RSA-SHA256")
    .update(`${encodedHeader}.${encodedData}`)
    .verify(publicKey, signature, "base64url");
}
let token = await createJWT({
  data: { sub: "1234567890", name: "John Doe", admin: true },
  privateKey,
  options: { expiresIn: 15 * 60000 },
});
console.log(token);
console.log(await decode(token, pubKey));
console.log(await verify(token, pubKey));
