import { toSocketIo } from "@mswjs/socket.io-binding"
import { ws } from "msw"

import { authMockService } from "@/features/auth/mocks"
import {
  catalogMockFacade,
  catalogRealtimeMockService,
} from "@/features/catalog/mocks"
import type { NftUpdatedEvent } from "@/features/catalog"
import type { Order, OrderUpdatedEvent } from "@/features/orders"
import { orderMockService } from "@/features/orders/mocks"
import {
  mockScenarioCookieName,
  resolveMockScenario,
} from "@/shared/mocks"
import { realtimeSubscriptionSchema } from "@/shared/realtime"

import { realtimeMockStorage } from "./realtime-mock-storage"

const realtimeServer = ws.link("wss://realtime.kurio.test/")
const nftEventDelay = 1_500
const orderEventDelay = 500
const realtimeNftId = "nft_genesis_014"

function readScenario() {
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${mockScenarioCookieName}=`))
  const cookieValue = cookie?.slice(mockScenarioCookieName.length + 1)

  return resolveMockScenario(
    cookieValue ? decodeURIComponent(cookieValue) : undefined,
    import.meta.env.VITE_MOCK_SCENARIO,
  )
}

function createNftEvent(): NftUpdatedEvent | null {
  const nft = catalogRealtimeMockService.applyScenarioUpdate()

  if (!nft) return null

  return {
    editions: nft.editions,
    eventId: `nft:${nft.id}:v${nft.version}`,
    item: catalogMockFacade.toCatalogItem(nft),
    occurredAt: new Date().toISOString(),
    resourceId: nft.id,
    version: nft.version,
  }
}

function createOldNftEvent(event: NftUpdatedEvent): NftUpdatedEvent {
  const version = Math.max(1, event.version - 1)

  return {
    ...event,
    editions: event.editions.map((edition, index) =>
      index === 0 ? { ...edition, priceEth: "0.42" } : edition,
    ),
    eventId: `${event.eventId}:old`,
    item: { ...event.item, priceEth: "0.42", version },
    version,
  }
}

function createOrderEvent(
  ownerId: string,
  order: Order,
): OrderUpdatedEvent {
  return {
    eventId: `order:${order.id}:v${order.version}`,
    occurredAt: order.updatedAt,
    order,
    ownerId,
    resourceId: order.id,
    version: order.version,
  }
}

export const realtimeHandler = realtimeServer.addEventListener(
  "connection",
  (connection) => {
    const { client } = toSocketIo(connection)
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const scheduledNftScenarios = new Set<string>()

    function schedule(callback: () => void, delayMs: number) {
      const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delayMs)

      timers.add(timer)
    }

    connection.client.addEventListener("close", () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    })

    function handleSubscription(payload: unknown) {
      const result = realtimeSubscriptionSchema.safeParse(payload)

      if (!result.success) return

      const subscription = result.data
      const authenticatedUserId = authMockService.getAuthenticatedUserId()
      const expectedOwnerId = authenticatedUserId ?? "guest"

      if (subscription.ownerId !== expectedOwnerId) {
        connection.client.close(1008, "The realtime identity is invalid.")
        return
      }

      const scenario = readScenario()
      const isNftScenario =
        scenario === "realtime-nft-update" ||
        scenario === "realtime-nft-event-ordering"

      if (
        isNftScenario &&
        subscription.nftIds.includes(realtimeNftId) &&
        !scheduledNftScenarios.has(scenario)
      ) {
        scheduledNftScenarios.add(scenario)
        schedule(() => {
          const event = createNftEvent()

          if (!event) return

          client.emit("nft.updated", event)

          if (scenario === "realtime-nft-event-ordering") {
            schedule(() => client.emit("nft.updated", event), 100)
            schedule(
              () => client.emit("nft.updated", createOldNftEvent(event)),
              200,
            )
          }
        }, nftEventDelay)
      }

      if (subscription.orderIds.length === 0) return

      for (const orderId of subscription.orderIds) {
        const order = authenticatedUserId
          ? orderMockService.find(authenticatedUserId, orderId)
          : null

        if (!authenticatedUserId || !order) continue
        if (order.status !== "pending") {
          client.emit(
            "order.updated",
            createOrderEvent(authenticatedUserId, order),
          )
          continue
        }
        if (scenario === "order-pending") continue

        if (
          scenario === "realtime-order-reconnect" &&
          realtimeMockStorage.consumeOrderInterruption(orderId)
        ) {
          connection.client.close(1012, "Simulated realtime interruption.")
          return
        }

        schedule(() => {
          const nextOrder = scenario === "payment-declined"
            ? orderMockService.refuse(authenticatedUserId, orderId)
            : orderMockService.confirm(authenticatedUserId, orderId)

          if (!nextOrder) return

          client.emit(
            "order.updated",
            createOrderEvent(authenticatedUserId, nextOrder),
          )
        }, orderEventDelay)
      }
    }

    client.on("realtime.subscribe", (_event, payload) => {
      handleSubscription(payload)
    })
  },
)
