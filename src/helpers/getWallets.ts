import type { WalletProvider } from "@starknet-io/get-starknet-core"
import type { StarknetWindowObject } from "@starknet-io/types-js"
import { ARGENT_X_ICON } from "../connectors/injected/constants"

export const replaceArgentXIcon = async (
  wallets: StarknetWindowObject[] | WalletProvider[],
) => {
  wallets.find((w: StarknetWindowObject | WalletProvider) => {
    if (w.id === "argentX") {
      w.icon = ARGENT_X_ICON
    }
  })
}
