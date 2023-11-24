import { Hex } from "../schemas/hexSchema"

export const uint256ToBigInt = (low: Hex, high: Hex): bigint => {
  return BigInt(low) + (BigInt(high) << BigInt(128))
}
