import type { Meta, StoryObj } from "@storybook/react"

import React from "react"
import { StarknetkitButton } from "../src/components/connect/StarknetkitButton"
import { ConnectButtonProvider } from "../src/components/WalletContext"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof StarknetkitButton> = {
  component: StarknetkitButton,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof StarknetkitButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {
  args: {},
  decorators: [
    (Story) => (
      <ConnectButtonProvider>
        <Story />
      </ConnectButtonProvider>
    ),
  ],
}

export const WithCustomStyle: Story = {
  args: {
    style: {
      background: "black",
      color: "white",
    },
  },
  decorators: [
    (Story) => (
      <ConnectButtonProvider>
        <Story />
      </ConnectButtonProvider>
    ),
  ],
}
