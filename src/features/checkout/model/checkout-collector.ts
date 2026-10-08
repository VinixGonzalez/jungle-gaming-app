import {
  collectorDataSchema,
  type CollectorData,
} from "../contracts"

const empty: Required<CollectorData> = {
  displayName: "",
  username: "",
  email: "",
  profileName: "",
  secondaryEns: "",
  referralCode: "",
  ensName: "",
  notes: "",
}

function getDefaults(
  displayName: string,
  username: string,
  email: string,
  ensName: string | null,
): Required<CollectorData> {
  return {
    ...empty,
    displayName,
    username,
    email,
    ensName: ensName ?? "",
  }
}

function normalize(
  collector: Partial<CollectorData>,
): Required<CollectorData> {
  return {
    displayName: collector.displayName ?? "",
    username: collector.username ?? "",
    email: collector.email ?? "",
    profileName: collector.profileName ?? "",
    secondaryEns: collector.secondaryEns ?? "",
    referralCode: collector.referralCode ?? "",
    ensName: collector.ensName ?? "",
    notes: collector.notes ?? "",
  }
}

function isSame(left: CollectorData, right: CollectorData) {
  const leftResult = collectorDataSchema.safeParse(left)
  const rightResult = collectorDataSchema.safeParse(right)

  return JSON.stringify(
    normalize(leftResult.success ? leftResult.data : left),
  ) === JSON.stringify(
    normalize(rightResult.success ? rightResult.data : right),
  )
}

export const checkoutCollector = {
  empty,
  getDefaults,
  isSame,
  normalize,
}
