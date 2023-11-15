import type { Meta, StoryObj } from "@storybook/react"

import { ConnectedMenu } from "../ui/ConnectedMenu"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof ConnectedMenu> = {
  component: ConnectedMenu,
}

export default meta
type Story = StoryObj<typeof ConnectedMenu>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    walletHref: "localhost:3005",
  },
}
