import { createAccountHandlers } from "@/features/account/mocks"
import { authMockService } from "@/features/auth/mocks"
import { cartMockService } from "@/features/cart/mocks"
import { catalogMockFacade } from "@/features/catalog/mocks"
import { createCheckoutHandlers } from "@/features/checkout/mocks"
import { createFavoriteHandlers } from "@/features/favorites/mocks"
import { createOrderHandlers } from "@/features/orders/mocks"
import {
  createWalletHandlers,
  walletMockService,
} from "@/features/wallets/mocks"

import { realtimeHandler } from "./realtime.handler"

const walletHandlers = createWalletHandlers({
  getAuthenticatedUserId: authMockService.getAuthenticatedUserId,
})
const accountHandlers = createAccountHandlers({
  auth: authMockService,
  wallets: walletMockService,
})
const favoriteHandlers = createFavoriteHandlers({
  getAuthenticatedUserId: authMockService.getAuthenticatedUserId,
  getCatalogItems: () =>
    catalogMockFacade.items.map(catalogMockFacade.toCatalogItem),
})
const checkoutHandlers = createCheckoutHandlers({
  getAuthenticatedUserId: authMockService.getAuthenticatedUserId,
  readCart: cartMockService.readCart,
  createCartResponse: cartMockService.createCartResponse,
})
const orderHandlers = createOrderHandlers({
  getAuthenticatedUserId: authMockService.getAuthenticatedUserId,
})

export const deferredHandlers = [
  realtimeHandler,
  ...favoriteHandlers,
  ...walletHandlers,
  ...accountHandlers,
  ...checkoutHandlers,
  ...orderHandlers,
]
