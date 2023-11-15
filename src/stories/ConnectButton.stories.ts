import type { Meta, StoryObj } from "@storybook/react"

import { ConnectButton } from "../ui/ConnectButton"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof ConnectButton> = {
  component: ConnectButton,
  argTypes: {
    connect: { action: "clicked" },
    disconnect: { action: "disconnect" },
  },
}

export default meta
type Story = StoryObj<typeof ConnectButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const NotConnected: Story = {
  args: {
    isConnected: false,
  },
}

export const Connected: Story = {
  args: {
    isConnected: true,
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    balance: "0.0001 ETH",
  },
}
