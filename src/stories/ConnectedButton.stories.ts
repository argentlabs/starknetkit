import type { Meta, StoryObj } from "@storybook/react"

import { ConnectedButton } from "../ui/ConnectedButton"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof ConnectedButton> = {
  component: ConnectedButton,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof ConnectedButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

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

/* 
// mock context
export const Webwallet: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    balance: "0.0001 ETH",
  },
}


export const WithCustomDropdown: Story = {
  args: {
    address:
      "0x010C11110B1111D1Ab1C11f1f11Df11fcFc1B11E11bAc1C110E11111B1111111",
    balance: "0.0001 ETH",
  },
}

*/
