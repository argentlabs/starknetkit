import type { Meta, StoryObj } from "@storybook/react"

import { NotificationItem } from "../src/components/Notifications/NotificationItem"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof NotificationItem> = {
  component: NotificationItem,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof NotificationItem>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {
  args: {
    action: "Send",
    description: "0.005 ETH was sent to 0x1234...5678",
    time: "just now",
  },
}

export const Unread: Story = {
  args: {
    action: "Send",
    description: "0.005 ETH was sent to 0x1234...5678",
    time: "just now",
    isUnread: true,
  },
}
