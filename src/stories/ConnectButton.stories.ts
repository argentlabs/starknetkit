import type { Meta, StoryObj } from "@storybook/react"

import { ConnectButton } from "../ui/ConnectButton"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof ConnectButton> = {
  component: ConnectButton,
  argTypes: {
    connect: { action: "clicked" },
  },
}

export default meta
type Story = StoryObj<typeof ConnectButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {}
