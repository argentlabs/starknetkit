import { Contract, ProviderInterface, constants, hash } from "starknet"

import { starknetId } from "starknet"
import useSWR from "swr"
import {
  arrayReference,
  getStarknetIdMulticallContract,
  hardcoded,
  staticExecution,
} from "../helpers/starknetId"

type UseStarknetId = {
  address?: string
  chainId: constants.StarknetChainId
  displayStarknetId?: boolean
  provider: ProviderInterface
}

export const useStarknetId = ({
  address,
  chainId,
  displayStarknetId,
  provider,
}: UseStarknetId) => {
  return useSWR(
    [address && [`${chainId}::${address}`], "starknetId"],
    () => {
      if (!address || !displayStarknetId) {
        return {
          starknetId: undefined,
          starknetIdAvatar: undefined,
        }
      }

      return getStarknetId(address, chainId, provider)
    },
    {
      revalidateOnMount: true,
      dedupingInterval: 1000 * 60 * 60 * 1,
    },
  )
}

const getStarknetId = async (
  address: string,
  chainId: constants.StarknetChainId,
  provider: ProviderInterface,
) => {
  const multicallAddress = getStarknetIdMulticallContract(chainId)
  const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

  const { abi: multicallAbi } = await provider.getClassAt(multicallAddress)
  const multicallContract = new Contract(
    multicallAbi,
    multicallAddress,
    provider,
  )

  try {
    const data = await multicallContract.call("aggregate", [
      [
        {
          execution: staticExecution(),
          to: hardcoded(starknetIdContractAddress),
          selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
          calldata: [hardcoded(address)],
        },
        {
          execution: staticExecution(),
          to: hardcoded(starknetIdContractAddress),
          selector: hardcoded(hash.getSelectorFromName("domain_to_id")),
          calldata: [arrayReference(0, 0)],
        },
      ],
    ])

    if (Array.isArray(data)) {
      const name = starknetId.useDecoded(data[0].slice(1))
      return {
        starknetId: name,
        starknetIdAvatar: `https://starknet.id/api/identicons/${data[1][0].toString()}`,
      }
    }
    return {
      starknetId: undefined,
      starknetIdAvatar: undefined,
    }
  } catch (e) {
    console.error(e)
  }
}
