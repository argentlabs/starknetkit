import type { StarknetWindowObject } from "get-starknet-core"
import { FC, PropsWithChildren, createContext, useMemo, useState } from "react"

export interface WalletContextValue {
  wallet: StarknetWindowObject | null
  setWallet: (wallet: StarknetWindowObject | null) => void
}

export const WalletContext = createContext<WalletContextValue>({
  wallet: null,
  setWallet: () => {},
})

export const ConnectButtonProvider: FC<PropsWithChildren> = ({ children }) => {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null)
  const contextValue = useMemo(
    () => ({
      wallet,
      setWallet,
    }),
    [wallet],
  )
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}
