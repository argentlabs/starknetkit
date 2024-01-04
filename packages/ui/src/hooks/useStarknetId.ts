import { getBatchProvider } from "@argent/x-multicall"
import { Call, ProviderInterface, constants, starknetId } from "starknet"
import useSWR from "swr"

type UseStarknetId = {
  address?: string
  chainId: constants.StarknetChainId
  displayStarknetId?: boolean
  displayStarknetIdAvatar?: boolean
  provider: ProviderInterface
}

export const useStarknetId = ({
  address,
  chainId,
  displayStarknetId,
  displayStarknetIdAvatar,
  provider,
}: UseStarknetId) => {
  return useSWR(
    [address && [`${chainId}::${address}`], "starknetId"],
    () => {
      if (!address || (!displayStarknetId && !displayStarknetIdAvatar)) {
        return {
          starknetId: undefined,
          starknetIdAvatar: undefined,
        }
      }

      return getStarknetId(address, chainId, provider, displayStarknetIdAvatar)
    },
    {
      revalidateOnMount: true,
      dedupingInterval: 1000 * 60 * 60 * 1,
    },
  )
}

// TODO: remove after starknetkit version is updated
const defaultMulticallAddress =
  "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4"

const getStarknetId = async (
  address: string,
  chainId: constants.StarknetChainId,
  provider: ProviderInterface,
  displayStarknetIdAvatar?: boolean,
) => {
  try {
    const starknetIdContractAddress = starknetId.getStarknetIdContract(chainId)

    // TODO: remove after starknetkit is updated
    const multiCall = getBatchProvider(
      provider,
      undefined,
      defaultMulticallAddress,
    )

    const callAddressToDomain: Call = {
      contractAddress: starknetIdContractAddress,
      entrypoint: "address_to_domain",
      calldata: [address],
    }

    const domainResponse = await multiCall.callContract(callAddressToDomain)

    const decimalDomain = domainResponse.result
      .map((element) => BigInt(element))
      .slice(1)

    const starknetIdName = starknetId.useDecoded(decimalDomain)
    let starknetIdAvatar: string | undefined

    if (displayStarknetIdAvatar) {
      const callDomainToId: Call = {
        contractAddress: starknetIdContractAddress,
        entrypoint: "domain_to_id",
        calldata: [decimalDomain],
      }

      const domainToIdResponse = await multiCall.callContract(callDomainToId)
      starknetIdAvatar = `https://starknet.id/api/identicons/${domainToIdResponse.result[0].toString()}`
    }

    return {
      starknetId: starknetIdName,
      starknetIdAvatar: starknetIdAvatar,
    }
  } catch (e) {
    console.error(e)
  }

  return {
    starknetId: undefined,
    starknetIdAvatar: undefined,
  }
}
