
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

const pubKeyPath = path.resolve(__dirname, 'path/to/jwt.key.pub');
const pubKey = fs.readFileSync(pubKeyPath, 'utf8');
const cryptoPublicKey = crypto.createPublicKey(pubKey);

export interface Keypair {
  privateKey: string;
  publicKey: crypto.KeyObject;
}

export interface SignOptions {
  expiresIn?: number; // milliseconds
}

export interface SignInput {
  data: object;
  keypair: Keypair;
  options?: SignOptions;
}

function sign({ data, keypair, options = {} }: SignInput) {
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64");
  const expiresIn = Date.now() + (options.expiresIn || 15 * 60000);
  const encodedData = Buffer.from(JSON.stringify({ ...data, exp: expiresIn })).toString("base64");

  crypto.createHash("SHA256").update(`${header}.${encodedData}`).digest("base64");
}

export default sign;
