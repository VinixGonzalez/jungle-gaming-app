import { z } from "zod"

import {
  authFieldLimits,
  authUserSchema,
} from "@/features/auth/contracts"
import { walletFieldLimits } from "@/features/wallets/contracts"

const profileEnsNameSchema = authUserSchema.shape.ensName.unwrap()
const walletAliasSchema = z
  .string()
  .trim()
  .min(2, "O apelido deve ter pelo menos 2 caracteres.")
  .max(
    walletFieldLimits.label,
    `O apelido deve ter no máximo ${walletFieldLimits.label} caracteres.`,
  )

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .max(
    authFieldLimits.password,
    `A senha deve ter no máximo ${authFieldLimits.password} caracteres.`,
  )

export const collectorProfileSchema = authUserSchema.extend({
  walletAlias: walletAliasSchema.nullable(),
})

export const updateProfileInputSchema = z.object({
  displayName: authUserSchema.shape.displayName,
  username: authUserSchema.shape.username,
  email: authUserSchema.shape.email,
  ensName: profileEnsNameSchema,
  walletAlias: walletAliasSchema.nullable(),
})

export const profileFormSchema = updateProfileInputSchema
  .omit({ ensName: true })
  .extend({
    ensLabel: z
      .string()
      .trim()
      .toLowerCase()
      .max(authFieldLimits.ensLabel, "O nome ENS é muito longo.")
      .regex(
        /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/,
        "Informe um nome ENS válido.",
      ),
    walletAlias: z.union([walletAliasSchema, z.literal("")]).nullable(),
  })

export const avatarInputSchema = z.object({
  dataUrl: z
    .string()
    .max(1_400_000, "A imagem deve ter no máximo 1 MB.")
    .regex(
      /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/,
      "Envie uma imagem PNG, JPEG ou WebP válida.",
    ),
})

export const changePasswordInputSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
  .refine((input) => input.currentPassword !== input.newPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"],
  })

export const changePasswordFormSchema = changePasswordInputSchema
  .extend({
    passwordConfirmation: passwordSchema,
  })
  .superRefine((form, context) => {
    if (form.newPassword === form.passwordConfirmation) return

    context.addIssue({
      code: "custom",
      message: "As senhas devem ser iguais.",
      path: ["passwordConfirmation"],
    })
  })

export type CollectorProfile = z.infer<typeof collectorProfileSchema>
export type UpdateProfileInput = z.input<typeof updateProfileInputSchema>
export type ProfileFormInput = z.input<typeof profileFormSchema>
export type AvatarInput = z.input<typeof avatarInputSchema>
export type ChangePasswordInput = z.input<
  typeof changePasswordInputSchema
>
export type ChangePasswordFormInput = z.input<
  typeof changePasswordFormSchema
>
