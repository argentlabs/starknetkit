import type { Meta, StoryObj } from "@storybook/react"

import React from "react"
import { ConnectedButton } from "../src/components/connect/ConnectedButton"
import { WalletContext } from "../src/components/WalletContext"
import { BellIcon } from "../src/icons/BellIcon"
import { RpcProvider, constants } from "starknet"

const meta: Meta<typeof ConnectedButton> = {
  component: ConnectedButton,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof ConnectedButton>

export const Base: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
  },
}

export const WithBalance: Story = {
  args: {
    address:
      "0x0225575a8E93461e264a580f3AaA6D49922A8ec5826a2cF0DDeECdA85b9929C2",
    accountInfo: { showBalance: true },
    symbol: "ETH",
    provider: new RpcProvider({
      nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
    }),
  },
}

export const WithStarknetId: Story = {
  args: {
    address:
      "0x057b9b0418704ce030824f827aec7b7f930915c1fc56b22ea4a47c51c2ea29cb",
    accountInfo: {
      showBalance: true,
      displayStarknetId: true,
    },
    chainId: constants.StarknetChainId.SN_GOERLI,
    symbol: "ETH",
    provider: new RpcProvider({
      nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
    }),
  },
}

export const WithStarknetIdAvatar: Story = {
  args: {
    address:
      "0x057b9b0418704ce030824f827aec7b7f930915c1fc56b22ea4a47c51c2ea29cb",
    accountInfo: {
      showBalance: true,
      displayStarknetIdAvatar: true,
    },
    chainId: constants.StarknetChainId.SN_GOERLI,
    symbol: "ETH",
    provider: new RpcProvider({
      nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
    }),
  },
}

export const WithStarknetIdAndAvatar: Story = {
  args: {
    address:
      "0x057b9b0418704ce030824f827aec7b7f930915c1fc56b22ea4a47c51c2ea29cb",
    accountInfo: {
      showBalance: true,
      displayStarknetId: true,
      displayStarknetIdAvatar: true,
    },
    chainId: constants.StarknetChainId.SN_GOERLI,
    symbol: "ETH",
    provider: new RpcProvider({
      nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5",
    }),
  },
}

export const Webwallet: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    webWalletUrl: "http://localhost:3005",
  },
  decorators: [
    (Story) => (
      <WalletContext.Provider
        value={{
          wallet: {
            id: "argentWebWallet",
            selectedAddress:
              "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
            // Add other missing properties here
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          setWallet: () => {},
        }}
      >
        <Story />
      </WalletContext.Provider>
    ),
  ],
}

export const WithCustomDropdown: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    dropdownElements: [
      {
        icon: <BellIcon />,
        label: "Notifications",
        onClick: () => {},
      },
    ],
  },
}

export const WithCustomStyle: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    style: {
      background: "black",
      color: "white",
    },
  },
}
