import type { Meta, StoryObj } from "@storybook/react"

import { NotificationButton } from "../src/components/Notifications/NotificationButton"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof NotificationButton> = {
  component: NotificationButton,
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof NotificationButton>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args

export const Base: Story = {
  args: {
    notifications: [
      {
        action: "Send",
        description: "0.005 ETH was sent to 0x1234...5678",
        time: "Just now",
      },
      {
        action: "Mint",
        description: "A cool nft was minted",
        time: "2 minutes ago",
      },
      {
        action: "Adding liquidity",
        description: "0.05 ETH and 100 DAI are being added to the pool",
        time: "3 Oct 2023, 11:40 AM",
      },
    ],
  },
}

export const WithNotifications: Story = {
  args: {
    hasNotifications: true,
    notifications: [
      {
        action: "Send",
        description: "0.005 ETH was sent to 0x1234...5678",
        time: "Just now",
        isUnread: true,
      },
      {
        action: "Mint",
        description: "A cool nft was minted",
        time: "2 minutes ago",
      },
      {
        action: "Adding liquidity",
        description: "0.05 ETH and 100 DAI are being added to the pool",
        time: "3 Oct 2023, 11:40 AM",
        isUnread: true,
      },
    ],
  },
}
