import { RPC_NODE_URL_MAINNET, RPC_NODE_URL_TESTNET } from "../constants"

export function mapTargetUrlToNodeUrl(target: string): string {
  try {
    const { origin } = new URL(target)
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return RPC_NODE_URL_TESTNET
    }
    if (origin.includes("hydrogen")) {
      return RPC_NODE_URL_TESTNET
    }
    if (origin.includes("staging")) {
      return RPC_NODE_URL_MAINNET
    }
    if (origin.includes("argent.xyz")) {
      return RPC_NODE_URL_MAINNET
    }
  } catch (e) {
    console.warn(
      "Could not determine rpc nodeUrl from target URL, defaulting to mainnet",
    )
  }
  return RPC_NODE_URL_MAINNET
}
