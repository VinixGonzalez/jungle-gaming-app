import { z } from "zod"

import { authFieldLimits } from "../config/auth-field-limits"

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(
    authFieldLimits.email,
    `O e-mail deve ter no máximo ${authFieldLimits.email} caracteres.`,
  )
  .pipe(z.email("Informe um e-mail válido."))

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(
    authFieldLimits.password,
    `A senha deve ter no máximo ${authFieldLimits.password} caracteres.`,
  )

export const authUserSchema = z.object({
  id: z.string().min(1),
  displayName: z
    .string()
    .trim()
    .min(2, "O nome de exibição deve ter pelo menos 2 caracteres.")
    .max(
      authFieldLimits.displayName,
      `O nome de exibição deve ter no máximo ${authFieldLimits.displayName} caracteres.`,
    ),
  username: z
    .string()
    .trim()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres.")
    .max(
      authFieldLimits.username,
      `O nome de usuário deve ter no máximo ${authFieldLimits.username} caracteres.`,
    ),
  email: emailSchema,
  ensName: z
    .string()
    .trim()
    .toLowerCase()
    .max(authFieldLimits.ensName, "O nome ENS é muito longo.")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.eth$/,
      "Informe um nome ENS válido terminado em .eth.",
    )
    .nullable(),
  avatarUrl: z.string().min(1).nullable(),
})

export const authSessionSchema = z.object({
  user: authUserSchema,
  expiresAt: z.iso.datetime({ offset: true }),
})

export const loginInputSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerInputSchema = z.object({
  username: authUserSchema.shape.username,
  email: emailSchema,
  password: passwordSchema,
})

export const registerFormSchema = registerInputSchema
  .extend({
    passwordConfirmation: passwordSchema,
  })
  .superRefine((form, context) => {
    if (form.password !== form.passwordConfirmation) {
      context.addIssue({
        code: "custom",
        message: "As senhas devem ser iguais.",
        path: ["passwordConfirmation"],
      })
    }
  })

export type AuthUser = z.infer<typeof authUserSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
export type LoginInput = z.input<typeof loginInputSchema>
export type RegisterInput = z.input<typeof registerInputSchema>
export type RegisterFormInput = z.input<typeof registerFormSchema>
