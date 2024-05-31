import { constants } from "starknet"
import { ChainId } from "starknet-types"

export const getStarknetChainId = (
  chainId: ChainId,
): constants.StarknetChainId =>
  chainId === constants.StarknetChainId.SN_MAIN
    ? constants.StarknetChainId.SN_MAIN
    : constants.StarknetChainId.SN_SEPOLIA
