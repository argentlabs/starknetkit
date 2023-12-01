import { constants } from "starknet"

// Using NetworkName as a value.
const Network: typeof constants.NetworkName = constants.NetworkName

const DEVELOPMENT_NETWORK = Network.SN_GOERLI

export function mapTargetUrlToNetworkId(target: string): constants.NetworkName {
  try {
    const { origin } = new URL(target)
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return DEVELOPMENT_NETWORK
    }
    if (origin.includes("hydrogen")) {
      return Network.SN_GOERLI
    }
    if (origin.includes("staging")) {
      return Network.SN_MAIN
    }
    if (origin.includes("argent.xyz")) {
      return Network.SN_MAIN
    }
  } catch (e) {
    console.warn(
      "Could not determine network from target URL, defaulting to mainnet-alpha",
    )
  }
  return Network.SN_MAIN
}

const RPC_NODE_URL_TESTNET =
  "https://api.hydrogen.argent47.net/v1/starknet/goerli/rpc/v0.5"
const RPC_NODE_URL_MAINNET =
  "https://cloud.argent-api.com/v1/starknet/goerli/rpc/v0.5"

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
