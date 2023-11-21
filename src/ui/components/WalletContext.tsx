import { StarknetWindowObject } from "get-starknet-core"
import { ReactNode, createContext, useMemo, useState } from "react"

interface WalletContextValue {
  wallet: StarknetWindowObject | null
  setWallet: (wallet: StarknetWindowObject | null) => void
}

export const WalletContext = createContext<WalletContextValue>({
  wallet: null,
  setWallet: () => {},
})

interface WalletButtonProviderProps {
  children: ReactNode
}

export const ConnectButtonProvider = ({
  children,
}: WalletButtonProviderProps) => {
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
