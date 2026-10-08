import { z } from "zod"

import { authUserSchema } from "../api/auth.schemas"

const authAccountFixtureSchema = z.object({
  user: authUserSchema,
  passwordDigest: z.string().regex(/^[a-f0-9]{64}$/),
})

export const authAccountFixtures = authAccountFixtureSchema.array().min(2).parse([
  {
    user: {
      id: "user_luna-rocha",
      displayName: "Luna Rocha",
      username: "luna.rocha",
      email: "luna.rocha@kurio.test",
      ensName: "luna-rocha.eth",
      avatarUrl: null,
    },
    passwordDigest:
      "0bc1c757b52ac5f4c5ae0c39ec0686d5bd50a26c00094c77e2dcb0e88c219cc7",
  },
  {
    user: {
      id: "user_davi-moura",
      displayName: "Davi Moura",
      username: "davi.moura",
      email: "davi.moura@kurio.test",
      ensName: "davi-moura.eth",
      avatarUrl: null,
    },
    passwordDigest:
      "ca9c92f1fc37e5e1607b3102d1d07ff555104c44b78b2f4fa88b5bc351b70d1d",
  },
])
