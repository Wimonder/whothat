import { FastifyInstance } from "fastify";
import {
  getSessionHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerUserHandler,
} from "./auth-controller";
import { $ref } from "./auth-schema";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        body: $ref("createUserSchema"),
        response: {
          201: $ref("createUserResponseSchema"),
        },
      },
    },
    registerUserHandler,
  );
  fastify.post(
    "/login",
    {
      schema: {
        body: $ref("loginSchema"),
        response: {
          200: $ref("loginResponseSchema"),
        },
      },
    },
    loginHandler,
  );
  fastify.get(
    "/session",
    {
      schema: {
        response: {
          200: $ref("sessionResponseSchema"),
        },
      },
    },
    getSessionHandler,
  );
  fastify.post(
    "/logout",
    {
      schema: {
        response: {
          200: $ref("logoutResponseSchema"),
        },
      },
    },
    logoutHandler,
  );
  fastify.post(
    "/refresh",
    {
      schema: {
        response: {
          200: $ref("refreshResponseSchema"),
        },
      },
    },
    refreshHandler,
  );
}
