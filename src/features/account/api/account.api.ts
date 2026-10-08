import { httpClient } from "@/shared/api"

import {
  avatarInputSchema,
  changePasswordInputSchema,
  collectorProfileSchema,
  updateProfileInputSchema,
  type AvatarInput,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "./account.schemas"

async function getProfile(signal?: AbortSignal) {
  const response = await httpClient.get<unknown>("/profile", { signal })

  return collectorProfileSchema.parse(response.data)
}

async function updateProfile(input: UpdateProfileInput) {
  const body = updateProfileInputSchema.parse(input)
  const response = await httpClient.patch<unknown>("/profile", body)

  return collectorProfileSchema.parse(response.data)
}

async function updateAvatar(input: AvatarInput) {
  const body = avatarInputSchema.parse(input)
  const response = await httpClient.put<unknown>("/profile/avatar", body)

  return collectorProfileSchema.parse(response.data)
}

async function removeAvatar() {
  const response = await httpClient.delete<unknown>("/profile/avatar")

  return collectorProfileSchema.parse(response.data)
}

async function changePassword(input: ChangePasswordInput) {
  const body = changePasswordInputSchema.parse(input)
  const response = await httpClient.patch("/profile/password", body)

  if (response.status !== 204) {
    throw new Error("A resposta da alteração de senha deve ter status 204.")
  }
}

export const accountApi = {
  changePassword,
  getProfile,
  removeAvatar,
  updateAvatar,
  updateProfile,
}
