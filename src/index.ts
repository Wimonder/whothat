import "dotenv/config";
import fastify from "fastify";

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

server.get("/healthcheck", async function () {
  return { status: "OK" };
});

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
