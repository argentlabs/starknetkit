import { useContext } from "react"
import { WalletContext } from "../components/WalletContext"

export const useAccount = () => {
  const { wallet } = useContext(WalletContext)
  return wallet
}
