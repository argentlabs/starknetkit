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
    if (origin.includes("dev")) {
      return Network.SN_GOERLI2
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
