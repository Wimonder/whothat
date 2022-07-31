import crypto from "crypto";

export interface Keypair {
  privateKey: string;
  publicKey: string;
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
