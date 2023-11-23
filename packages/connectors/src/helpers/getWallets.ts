import type { StarknetWindowObject, WalletProvider } from "get-starknet-core"
import { ARGENT_X_ICON } from "../connectors/injected/constants"

export const replaceArgentXIcon = async (
  wallets: StarknetWindowObject[] | WalletProvider[],
) => {
  wallets.find((w) => {
    if (w.id === "argentX") {
      w.icon = ARGENT_X_ICON
    }
  })
}
