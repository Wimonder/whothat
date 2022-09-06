import { buildJsonSchemas } from "fastify-zod";
import { z } from "zod";

const applicationCore = {
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
};

const applicationParamsSchema = z.object({
  applicationId: z.string({
    required_error: "Application ID is required",
  }),
});

const createApplicationSchema = z.object({ ...applicationCore });

const applicationResponseSchema = z.object({ ...applicationCore, id: z.string() });

const userCore = {
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  }),
};

const createUserSchema = z.object({
  ...userCore,
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

const createUserResponseSchema = z.object({
  id: z.string(),
  ...userCore,
});

const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z.string(),
});

const logoutResponseSchema = z.object({
  msg: z.string(),
});

const sessionResponseSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    username: z.string(),
  })
  .or(
    z.object({
      msg: z.string(),
    }),
  );

const tokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

const publicKeyResponseSchema = z.string();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type TokenInput = z.infer<typeof tokenSchema>;
export type TokenOutput = TokenInput;
export type ApplicationParams = z.infer<typeof applicationParamsSchema>;

export const { schemas: authSchemas, $ref } = buildJsonSchemas({
  createUserSchema,
  createUserResponseSchema,
  loginSchema,
  sessionResponseSchema,
  logoutResponseSchema,
  createApplicationSchema,
  applicationResponseSchema,
  publicKeyResponseSchema,
  applicationParamsSchema,
  tokenSchema,
});
