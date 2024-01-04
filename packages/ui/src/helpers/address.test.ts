import { describe, expect, test } from "vitest"

import { formatAddress, truncateAddress } from "./address"

describe("address", () => {
  test("should format address", async () => {
    const address = formatAddress("0x1")
    expect(address).toBe(
      "0x0000000000000000000000000000000000000000000000000000000000000001",
    )
  })

  test("should truncateAddress address", async () => {
    const address = formatAddress("0x1")
    const truncated = truncateAddress(address)
    expect(truncated).toBe("0x0000…0001")
  })
})
