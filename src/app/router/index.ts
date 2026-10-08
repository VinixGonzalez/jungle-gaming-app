import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import type { SearchSchemaInput } from "@tanstack/react-router"

import { queryClient } from "@/app/providers/query-client"
import { authSearchSchema } from "@/features/auth/model/auth-search.schema"
import { catalogSearchDefaults } from "@/features/catalog/model/catalog-search-defaults"
import {
  catalogSearchSchema,
  type CatalogSearch,
} from "@/features/catalog/model/catalog-search"
import { RootLayout } from "./root-layout"
import { getInitialCatalogPageSize } from "./get-initial-catalog-page-size"

const AccountRoute = lazyRouteComponent(
  () => import("@/routes/account-route"),
  "AccountRoute",
)
const CartRoute = lazyRouteComponent(
  () => import("@/routes/cart-route"),
  "CartRoute",
)
const CheckoutRoute = lazyRouteComponent(
  () => import("@/routes/checkout-route"),
  "CheckoutRoute",
)
const FavoritesRoute = lazyRouteComponent(
  () => import("@/routes/favorites-route"),
  "FavoritesRoute",
)
const HomeRoute = lazyRouteComponent(
  () => import("@/routes/home-route"),
  "HomeRoute",
)
const LoginRoute = lazyRouteComponent(
  () => import("@/routes/login-route"),
  "LoginRoute",
)
const NftDetailRoute = lazyRouteComponent(
  () => import("@/routes/nft-detail-route"),
  "NftDetailRoute",
)
const NotFoundRoute = lazyRouteComponent(
  () => import("@/routes/not-found-route"),
  "NotFoundRoute",
)
const OrderRoute = lazyRouteComponent(
  () => import("@/routes/order-route"),
  "OrderRoute",
)
const ProfileRoute = lazyRouteComponent(
  () => import("@/routes/profile-route"),
  "ProfileRoute",
)
const RegisterRoute = lazyRouteComponent(
  () => import("@/routes/register-route"),
  "RegisterRoute",
)
const WalletsRoute = lazyRouteComponent(
  () => import("@/routes/wallets-route"),
  "WalletsRoute",
)

interface RouterContext {
  queryClient: QueryClient
}

type CatalogSearchInput = Partial<CatalogSearch> & SearchSchemaInput

function validateCatalogSearch(search: CatalogSearchInput) {
  return catalogSearchSchema(search)
}

type AuthSearchInput = { returnTo?: string } & SearchSchemaInput

function validateAuthSearch(search: AuthSearchInput) {
  return authSearchSchema(search)
}

async function guardAnonymousRoute(
  context: RouterContext,
  returnTo?: string,
) {
  const { getAuthenticatedRedirect } = await import(
    "@/features/auth/query"
  )
  const destination = await getAuthenticatedRedirect(
    context.queryClient,
    returnTo,
  )

  if (destination) throw redirect({ href: destination, replace: true })
}

async function guardAuthenticatedRoute(
  context: RouterContext,
  returnTo: string,
) {
  const { getUnauthenticatedRedirect } = await import(
    "@/features/auth/query"
  )
  const destination = await getUnauthenticatedRedirect(
    context.queryClient,
    returnTo,
  )

  if (destination) throw redirect({ href: destination, replace: true })
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "marketplace",
  validateSearch: validateCatalogSearch,
  search: {
    middlewares: [stripSearchParams(catalogSearchDefaults)],
  },
  component: HomeRoute,
})

const homeRoute = createRoute({
  getParentRoute: () => marketplaceRoute,
  path: "/",
  loader: ({ context, location }) => {
    void import("@/features/catalog/query")
      .then(({ catalogQueryOptions }) =>
        context.queryClient.prefetchQuery(
          catalogQueryOptions({
            ...catalogSearchSchema(location.search),
            pageSize: getInitialCatalogPageSize(),
          }),
        ),
      )
      .catch(() => undefined)
  },
})

const loginRoute = createRoute({
  getParentRoute: () => marketplaceRoute,
  path: "login",
  validateSearch: validateAuthSearch,
  beforeLoad: ({ context, search }) =>
    guardAnonymousRoute(context, search.returnTo),
  component: LoginRoute,
})

const registerRoute = createRoute({
  getParentRoute: () => marketplaceRoute,
  path: "register",
  validateSearch: validateAuthSearch,
  beforeLoad: ({ context, search }) =>
    guardAnonymousRoute(context, search.returnTo),
  component: RegisterRoute,
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nfts/$slug",
  component: NftDetailRoute,
  loader: ({ context, params }) => {
    void import("@/features/catalog/query")
      .then(({ nftDetailQueryOptions }) =>
        context.queryClient.prefetchQuery(
          nftDetailQueryOptions(params.slug),
        ),
      )
      .catch(() => undefined)
  },
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartRoute,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  beforeLoad: ({ context, location }) =>
    guardAuthenticatedRoute(context, location.href),
  component: CheckoutRoute,
})

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  beforeLoad: ({ context, location }) =>
    guardAuthenticatedRoute(context, location.href),
  component: OrderRoute,
})

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "account",
  beforeLoad: ({ context, location }) =>
    guardAuthenticatedRoute(context, location.href),
  component: AccountRoute,
})

const profileRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/profile",
  component: ProfileRoute,
})

const walletsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/wallets",
  component: WalletsRoute,
})

const favoritesRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: "/favorites",
  component: FavoritesRoute,
})

const routeTree = rootRoute.addChildren([
  marketplaceRoute.addChildren([homeRoute, loginRoute, registerRoute]),
  nftDetailRoute,
  cartRoute,
  checkoutRoute,
  orderRoute,
  accountRoute.addChildren([profileRoute, walletsRoute, favoritesRoute]),
])

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultNotFoundComponent: NotFoundRoute,
  defaultPreload: "intent",
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

declare module "@tanstack/history" {
  interface HistoryState {
    authCanGoBack?: boolean
    authReturnTo?: string
  }
}
