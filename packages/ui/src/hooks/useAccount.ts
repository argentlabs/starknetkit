import { useContext, useMemo } from "react"
import { WalletContext } from "../components/WalletContext"
import { AccountInterface, ProviderInterface } from "starknet"
import { StarknetWindowObject } from "get-starknet-core"

type AccountResult = {
  /** The connected account object. */
  account?: AccountInterface
  /** The wallet object. */
  wallet?: StarknetWindowObject
}

export const useAccount = (): AccountResult => {
  const { wallet } = useContext(WalletContext)

  const account = useMemo(() => {
    if (!wallet) {
      return {
        account: undefined,
      }
    }

    return {
      account: wallet.account,
      wallet: wallet,
    }
  }, [wallet])
  return account
}
