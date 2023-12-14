import { describe, expect, test } from "vitest"

import { formatBalance } from "./formatBalance"
/* 
describe("createMerkleTreeForPolicies()", () => {
  test("should complete with valid policies", async () => {
    const proof = createMerkleTreeForPolicies([
      {
        contractAddress: "0x1",
        selector: "selector",
      },
    ])
    expect(proof.root).toBe(
      "0x11b9c3da2d94398a5eaafca97b30a3a9517d0b7743b50308d312e3b6416b830",
    )
  })
})
 */

describe("address", () => {
  test("should format balance", async () => {
    const formattedBalance = formatBalance({
      amount: 1250000000000000000n,
      decimals: 18,
      symbol: "ETH",
    })
    expect(formattedBalance).toBe("1.25 ETH")
  })

  test("should format balance with 4 decimals", async () => {
    const formattedBalance = formatBalance({
      amount: 1987654321000000000n,
      decimals: 18,
      symbol: "ETH",
    })
    expect(formattedBalance).toBe("1.9876 ETH")
  })

  test("should format balance with 8 decimals", async () => {
    const formattedBalance = formatBalance(
      {
        amount: 1987654321000000000n,
        decimals: 18,
        symbol: "ETH",
      },
      8,
    )
    expect(formattedBalance).toBe("1.98765432 ETH")
  })

  test("should show minor than 0.0001 balance", async () => {
    const formattedBalance = formatBalance({
      amount: 1n,
      decimals: 18,
      symbol: "ETH",
    })
    expect(formattedBalance).toBe("< 0.0001 ETH")
  })
})
