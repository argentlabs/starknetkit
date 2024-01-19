import { getRandomPublicRPCNode } from "../../../helpers/publicRcpNodes"

export function mapTargetUrlToNodeUrl(target: string): string {
  const publicRPCNode = getRandomPublicRPCNode()
  try {
    const { origin } = new URL(target)
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return publicRPCNode.testnet
    }
    if (origin.includes("hydrogen")) {
      return publicRPCNode.testnet
    }
    if (origin.includes("staging")) {
      return publicRPCNode.mainnet
    }
    if (origin.includes("argent.xyz")) {
      return publicRPCNode.mainnet
    }
  } catch (e) {
    console.warn(
      "Could not determine rpc nodeUrl from target URL, defaulting to mainnet",
    )
  }
  return publicRPCNode.mainnet
}
