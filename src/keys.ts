import crypto from "crypto";
import fs from "fs";
import path from "path";

// Read files
const pubKeyPath = path.resolve("./jwt.key.pub");
const pubKeyFile = fs.readFileSync(pubKeyPath, "utf8");
const privateKeyPath = path.resolve("./jwt.key");
const privateKeyFile = fs.readFileSync(privateKeyPath, "utf8");

// Export keys
export const publicKey = crypto.createPublicKey(pubKeyFile);
export const privateKey = crypto.createPrivateKey(privateKeyFile);
