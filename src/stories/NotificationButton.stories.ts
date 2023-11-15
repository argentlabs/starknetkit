import type { Meta, StoryObj } from "@storybook/react"

import { NotificationButton } from "../ui/NotificationButton"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof NotificationButton> = {
  component: NotificationButton,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof NotificationButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {
  args: {},
}

export const WithNotifications: Story = {
  args: {
    hasNotifications: true,
  },
}
