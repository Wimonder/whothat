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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
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
        params: $ref("applicationParamsSchema"),
        response: {
          200: $ref("refreshResponseSchema"),
        },
      },
    },
    refreshHandler,
  );
}
