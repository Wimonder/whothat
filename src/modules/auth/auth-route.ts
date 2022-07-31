import { FastifyInstance } from "fastify";
import { loginHandler, registerUserHandler } from "./auth-controller";
import { JsonSchemas } from "./auth-schema";

async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        body: JsonSchemas.createUserSchema,
        response: {
          201: JsonSchemas.createUserResponseSchema,
        },
      },
    },
    registerUserHandler,
  );
  fastify.post(
    "/login",
    {
      schema: {
        body: JsonSchemas.loginSchema,
        response: {
          200: JsonSchemas.loginResponseSchema,
        },
      },
    },
    loginHandler,
  );
}

export default authRoutes;
