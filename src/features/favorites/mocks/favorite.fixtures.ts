const initialFavoriteIdsByUserId: Record<string, readonly string[]> = {
  "user_luna-rocha": ["nft_genesis_014", "nft_quiet_orbit_028"],
  "user_davi-moura": ["nft_signal_bloom_007"],
}

export const favoriteFixtures = {
  getByUserId(userId: string) {
    return [...(initialFavoriteIdsByUserId[userId] ?? [])]
  },
}
