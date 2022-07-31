import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

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

const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const JsonSchemas = {
  createUserSchema: zodToJsonSchema(createUserSchema),
  createUserResponseSchema: zodToJsonSchema(createUserResponseSchema),
  loginSchema: zodToJsonSchema(loginSchema),
  loginResponseSchema: zodToJsonSchema(loginResponseSchema),
};
