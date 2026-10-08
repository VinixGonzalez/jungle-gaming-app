import type { Socket } from "socket.io-client"

import type { RealtimeSubscription } from "./realtime-subscription.schema"

type RealtimeEventName = "nft.updated" | "order.updated"
type RealtimeEventListener = (payload: unknown) => void

const nftSubscriptions = new Map<string, number>()
const orderSubscriptions = new Map<string, number>()
const connectListeners = new Set<() => void>()
const eventListeners = new Map<
  RealtimeEventName,
  Set<RealtimeEventListener>
>([
  ["nft.updated", new Set()],
  ["order.updated", new Set()],
])

let ownerId = "guest"
let socket: Socket | null = null
let socketPromise: Promise<Socket | null> | null = null
let connectionGeneration = 0

function emitSubscription() {
  if (!socket?.connected) return

  const subscription: RealtimeSubscription = {
    nftIds: [...nftSubscriptions.keys()],
    orderIds: [...orderSubscriptions.keys()],
    ownerId,
  }

  socket.emit("realtime.subscribe", subscription)
}

async function createSocket(generation: number) {
  const { io } = await import("socket.io-client")
  const nextSocket = io(
    import.meta.env.VITE_REALTIME_URL ?? "https://realtime.kurio.test",
    {
      autoConnect: false,
      path: "/socket.io",
      reconnectionDelay: 100,
      reconnectionDelayMax: 500,
      transports: ["websocket"],
    },
  )

  if (generation !== connectionGeneration) {
    nextSocket.disconnect()
    return null
  }

  nextSocket.on("connect", () => {
    emitSubscription()
    connectListeners.forEach((listener) => listener())
  })

  for (const event of eventListeners.keys()) {
    nextSocket.on(event, (payload: unknown) => {
      eventListeners.get(event)?.forEach((listener) => listener(payload))
    })
  }

  socket = nextSocket

  return nextSocket
}

function getSocket() {
  socketPromise ??= createSocket(connectionGeneration)

  return socketPromise
}

function resetConnection() {
  connectionGeneration += 1
  socket?.disconnect()
  socket = null
  socketPromise = null
}

function updateSubscription(
  subscriptions: Map<string, number>,
  resourceId: string,
) {
  subscriptions.set(resourceId, (subscriptions.get(resourceId) ?? 0) + 1)
  emitSubscription()

  return () => {
    const count = subscriptions.get(resourceId) ?? 0

    if (count <= 1) subscriptions.delete(resourceId)
    else subscriptions.set(resourceId, count - 1)

    emitSubscription()
  }
}

export const realtimeClient = {
  async connect() {
    const activeSocket = await getSocket()

    activeSocket?.connect()
  },
  disconnect() {
    resetConnection()
  },
  on(event: RealtimeEventName, listener: RealtimeEventListener) {
    const listeners = eventListeners.get(event)

    listeners?.add(listener)

    return () => listeners?.delete(listener)
  },
  onConnect(listener: () => void) {
    connectListeners.add(listener)

    return () => connectListeners.delete(listener)
  },
  setOwner(nextOwnerId: string) {
    if (nextOwnerId === ownerId) return

    ownerId = nextOwnerId
    orderSubscriptions.clear()
    resetConnection()
  },
  subscribeToNft(nftId: string) {
    return updateSubscription(nftSubscriptions, nftId)
  },
  subscribeToOrder(orderId: string) {
    return updateSubscription(orderSubscriptions, orderId)
  },
}
