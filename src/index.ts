import "dotenv/config";
import fastify from "fastify";
import { authRoutes } from "./modules/auth/auth-route";
import { authSchemas } from "./modules/auth/auth-schema";

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

// Register request and response schemas
for (const schema of authSchemas) {
  server.addSchema(schema);
}

// Add healthcheck endpoint
server.get("/healthcheck", async function () {
  return { status: "OK" };
});

// Register routes
server.register(authRoutes);

// Start server on specified port and host
if (process.env.PORT === undefined) {
  throw new Error("PORT is not defined");
}
const port = parseInt(process.env.PORT);

if (process.env.HOST === undefined) {
  throw new Error("HOST is not defined");
}
const host = process.env.HOST;

server.listen({ host, port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
