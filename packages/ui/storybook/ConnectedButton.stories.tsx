import type { Meta, StoryObj } from "@storybook/react"

import { ConnectedButton } from "../src/ConnectedButton"
import { WalletContext } from "../src/components/WalletContext"
import { BellIcon } from "../src/icons/BellIcon"


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

export const Full: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    showBalance: true,
  },
}

export const Webwallet: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
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
