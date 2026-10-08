import {
  authSessionSchema,
  authUserSchema,
  loginInputSchema,
  registerInputSchema,
  type AuthSession,
  type LoginInput,
  type RegisterInput,
  type AuthUser,
} from "../api/auth.schemas"
import { hashPassword } from "./auth-password"
import { authMockStorage } from "./auth-storage"

const sessionDurationMs = 8 * 60 * 60 * 1_000
const expiredSessionDate = "1970-01-01T00:00:00.000Z"

function createSession(
  user: AuthSession["user"],
  expiresAt = new Date(Date.now() + sessionDurationMs).toISOString(),
) {
  return authSessionSchema.parse({ user, expiresAt })
}

export const authMockService = {
  getAuthenticatedUserId() {
    const result = authMockService.getSession()

    return result.status === "success" ? result.session.user.id : null
  },

  async login(input: LoginInput) {
    const credentials = loginInputSchema.parse(input)
    const passwordDigest = await hashPassword(credentials.password)
    const state = authMockStorage.read()
    const account = state.accounts.find(
      (candidate) =>
        candidate.user.email === credentials.email &&
        candidate.passwordDigest === passwordDigest,
    )

    if (!account) return { status: "invalid-credentials" } as const

    const session = createSession(account.user)

    authMockStorage.write({
      ...state,
      session: {
        userId: session.user.id,
        expiresAt: session.expiresAt,
      },
    })

    return { status: "success", session } as const
  },

  async register(input: RegisterInput) {
    const registration = registerInputSchema.parse(input)
    const passwordDigest = await hashPassword(registration.password)
    const state = authMockStorage.read()

    if (
      state.accounts.some(
        (account) => account.user.email === registration.email,
      )
    ) {
      return { status: "email-conflict" } as const
    }

    const normalizedUsername = registration.username.toLowerCase()

    if (
      state.accounts.some(
        (account) =>
          account.user.username.toLowerCase() === normalizedUsername,
      )
    ) {
      return { status: "username-conflict" } as const
    }

    const user = authUserSchema.parse({
      id: `user_${crypto.randomUUID()}`,
      displayName: registration.username,
      username: registration.username,
      email: registration.email,
      ensName: null,
      avatarUrl: null,
    })
    const session = createSession(user)

    authMockStorage.write({
      accounts: [...state.accounts, { user, passwordDigest }],
      session: {
        userId: session.user.id,
        expiresAt: session.expiresAt,
      },
    })

    return { status: "success", session } as const
  },

  getSession() {
    const state = authMockStorage.read()

    if (!state.session) return { status: "missing" } as const

    if (Date.parse(state.session.expiresAt) <= Date.now()) {
      authMockStorage.write({ ...state, session: null })
      return { status: "expired" } as const
    }

    const account = state.accounts.find(
      (candidate) => candidate.user.id === state.session?.userId,
    )

    if (!account) {
      authMockStorage.write({ ...state, session: null })
      return { status: "missing" } as const
    }

    return {
      status: "success",
      session: createSession(account.user, state.session.expiresAt),
    } as const
  },

  getUser(userId: string) {
    const account = authMockStorage
      .read()
      .accounts.find((candidate) => candidate.user.id === userId)

    return account?.user ?? null
  },

  updateProfile(
    userId: string,
    input: Pick<
      AuthUser,
      "displayName" | "email" | "ensName" | "username"
    >,
  ) {
    const state = authMockStorage.read()
    const accountIndex = state.accounts.findIndex(
      (candidate) => candidate.user.id === userId,
    )

    if (accountIndex < 0) return { status: "not-found" } as const

    if (
      state.accounts.some(
        (account) =>
          account.user.id !== userId && account.user.email === input.email,
      )
    ) {
      return { status: "email-conflict" } as const
    }

    const normalizedUsername = input.username.toLowerCase()

    if (
      state.accounts.some(
        (account) =>
          account.user.id !== userId &&
          account.user.username.toLowerCase() === normalizedUsername,
      )
    ) {
      return { status: "username-conflict" } as const
    }

    const currentAccount = state.accounts[accountIndex]
    const user = authUserSchema.parse({ ...currentAccount.user, ...input })
    const accounts = [...state.accounts]
    accounts[accountIndex] = { ...currentAccount, user }

    authMockStorage.write({ ...state, accounts })

    return { status: "success", user } as const
  },

  updateAvatar(userId: string, avatarUrl: string | null) {
    const state = authMockStorage.read()
    const accountIndex = state.accounts.findIndex(
      (candidate) => candidate.user.id === userId,
    )

    if (accountIndex < 0) return { status: "not-found" } as const

    const currentAccount = state.accounts[accountIndex]
    const user = authUserSchema.parse({
      ...currentAccount.user,
      avatarUrl,
    })
    const accounts = [...state.accounts]
    accounts[accountIndex] = { ...currentAccount, user }

    authMockStorage.write({ ...state, accounts })

    return { status: "success", user } as const
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const state = authMockStorage.read()
    const accountIndex = state.accounts.findIndex(
      (candidate) => candidate.user.id === userId,
    )

    if (accountIndex < 0) return { status: "not-found" } as const

    const currentAccount = state.accounts[accountIndex]
    const currentPasswordDigest = await hashPassword(currentPassword)

    if (currentAccount.passwordDigest !== currentPasswordDigest) {
      return { status: "invalid-current-password" } as const
    }

    const newPasswordDigest = await hashPassword(newPassword)

    const accounts = [...state.accounts]
    accounts[accountIndex] = {
      ...currentAccount,
      passwordDigest: newPasswordDigest,
    }

    authMockStorage.write({ ...state, accounts })

    return { status: "success" } as const
  },

  logout() {
    const state = authMockStorage.read()
    authMockStorage.write({ ...state, session: null })
  },

  expireSession() {
    const state = authMockStorage.read()

    if (!state.session) return

    authMockStorage.write({
      ...state,
      session: { ...state.session, expiresAt: expiredSessionDate },
    })
  },
}
