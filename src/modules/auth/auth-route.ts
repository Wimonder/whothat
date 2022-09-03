import { FastifyInstance } from "fastify";
import {
  createApplicationHandler,
  getApplicationHandler,
  getApplicationPublicKeyHandler,
  getSessionHandler,
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerUserHandler,
} from "./auth-controller";
import { $ref } from "./auth-schema";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/application",
    {
      schema: {
        body: $ref("createApplicationSchema"),
        response: {
          201: $ref("applicationResponseSchema"),
        },
      },
    },
    createApplicationHandler,
  );
  fastify.get(
    "/application/:applicationId",
    {
      schema: {
        response: {
          200: $ref("applicationResponseSchema"),
        },
      },
    },
    getApplicationHandler,
  );
  fastify.get(
    "/application/:applicationId/public-key",
    {
      schema: {
        response: {
          200: $ref("publicKeyResponseSchema"),
        },
      },
    },
    getApplicationPublicKeyHandler,
  );
  fastify.post(
    "/:applicationId/register",
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
    "/:applicationId/login",
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
    "/:applicationId/session",
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
    "/:applicationId/logout",
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
    "/:applicationId/refresh",
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
