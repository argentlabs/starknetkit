import { constants } from "starknet"
import type { ChainId } from "@starknet-io/types-js"

export const getStarknetChainId = (
  chainId: ChainId,
): constants.StarknetChainId =>
  chainId === constants.StarknetChainId.SN_MAIN
    ? constants.StarknetChainId.SN_MAIN
    : constants.StarknetChainId.SN_SEPOLIA
