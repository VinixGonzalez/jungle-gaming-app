import { authMockService, createAuthHandlers } from "@/features/auth/mocks"
import { cartMockService, createCartHandlers } from "@/features/cart/mocks"
import { catalogHandlers } from "@/features/catalog/mocks"

const cartHandlers = createCartHandlers({
  getAuthenticatedUserId: authMockService.getAuthenticatedUserId,
})
const authHandlers = createAuthHandlers({
  onAuthenticated: cartMockService.claimGuestCart,
})
export const handlers = [
  ...catalogHandlers,
  ...cartHandlers,
  ...authHandlers,
]
