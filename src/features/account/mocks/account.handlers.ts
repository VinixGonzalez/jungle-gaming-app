import type { AccountHandlerDependencies } from "./account-handler.dependencies"
import { createAvatarHandlers } from "./avatar.handlers"
import { createPasswordHandlers } from "./password.handlers"
import { createProfileHandlers } from "./profile.handlers"

export function createAccountHandlers(
  dependencies: AccountHandlerDependencies,
) {
  return [
    ...createProfileHandlers(dependencies),
    ...createAvatarHandlers(dependencies),
    ...createPasswordHandlers(dependencies),
  ]
}
