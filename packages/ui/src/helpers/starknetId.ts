import { CairoCustomEnum, cairo, constants } from "starknet"

/**
 * Get starknet.id multicall contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getStarknetIdMulticallContract(
  chainId: constants.StarknetChainId,
): string {
  const starknetIdMainnetContract =
    "0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970"
  const starknetIdTestnetContract =
    "0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970"

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return starknetIdMainnetContract

    case constants.StarknetChainId.SN_GOERLI:
      return starknetIdTestnetContract

    default:
      throw new Error(
        "Starknet.id multicall contract is not yet deployed on this network",
      )
  }
}

export const hardcoded = (arg: string | number) =>
  new CairoCustomEnum({
    Hardcoded: arg,
  })

export const staticExecution = () => {
  return new CairoCustomEnum({
    Static: {},
  })
}

export const arrayReference = (call: number, pos: number): CairoCustomEnum => {
  return new CairoCustomEnum({
    ArrayReference: cairo.tuple(call, pos),
  })
}
