import type { Meta, StoryObj } from "@storybook/react"
import React from "react"

import { ActivityToast } from "../src/components/ActivityToast/ActivityToast"

// More on how to set up stories at: https://storybook.js.org/docs/svelte/writing-stories/introduction
const meta: Meta<typeof ActivityToast> = {
  component: ActivityToast,
}

export default meta
type Story = StoryObj<typeof ActivityToast>

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
const ShowToastButton: React.FC<{
  onClick: () => void
  label: string
}> = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      style={{
        border: "solid 1px #F0F0F0",
        borderRadius: "5px",
        padding: "12px",
        width: "200px",
      }}
    >
      {label}
    </button>
  )
}

const ActivityToastStory = () => {
  // Sets the hooks for both the label and primary props

  const [showToast, setShowToast] = React.useState(false)
  const [vertical, setVertical] = React.useState<"top" | "center" | "bottom">(
    "bottom",
  )
  const [horizontal, setHorizontal] = React.useState<
    "left" | "center" | "right"
  >("center")

  const clickButton = (
    v: "top" | "center" | "bottom",
    h: "left" | "center" | "right",
  ) => {
    setVertical(v)
    setHorizontal(h)
    setShowToast(true)
  }

  return (
    <>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <ShowToastButton
            onClick={() => clickButton("top", "left")}
            label="Top left"
          />
          <ShowToastButton
            onClick={() => clickButton("top", "center")}
            label="Top center"
          />
          <ShowToastButton
            onClick={() => clickButton("top", "right")}
            label="Top right"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <ShowToastButton
            onClick={() => clickButton("bottom", "left")}
            label="Bottom left"
          />
          <ShowToastButton
            onClick={() => clickButton("bottom", "center")}
            label="Bottom center"
          />
          <ShowToastButton
            onClick={() => clickButton("bottom", "right")}
            label="Bottom right"
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {" "}
          <ShowToastButton
            onClick={() => clickButton("center", "center")}
            label="Center"
          />
        </div>
        {showToast && (
          <ActivityToast
            action={"Swapping"}
            description={"0.005 ETH for 100 DAI"}
            showToast={showToast}
            closeToast={() => setShowToast(false)}
            vertical={vertical}
            horizontal={horizontal}
            duration={1000}
          />
        )}
      </div>
    </>
  )
}

export const Base: Story = {
  render: () => <ActivityToastStory />,
}
