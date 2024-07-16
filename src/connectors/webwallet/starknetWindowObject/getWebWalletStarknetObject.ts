import type { CreateTRPCProxyClient } from "@trpc/client"
import type { AppRouter } from "../helpers/trpc"
import type { WebWalletStarknetWindowObject } from "./argentStarknetWindowObject"
import { getArgentStarknetWindowObject } from "./argentStarknetWindowObject"
import {
  hideModal,
  setIframeHeight,
  setIframeSize,
  setIframeWidth,
  showModal,
} from "./wormhole"

type IframeProps = {
  modal: HTMLDivElement
  iframe: HTMLIFrameElement
}

export type ModalEvents =
  | {
      action: "show" | "hide"
      visible: boolean
    }
  | { action: "updateHeight"; height: number }
  | { action: "updateWidth"; width: number }
  | { action: "updateSize"; width: number; height: number }

export const getWebWalletStarknetObject = async (
  target: string,
  proxyLink: CreateTRPCProxyClient<AppRouter>,
  iframeProps?: IframeProps,
): Promise<WebWalletStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }
  const starknetWindowObject = getArgentStarknetWindowObject(
    {
      host: globalWindow.location.origin,
      id: "argentWebWallet",
      icon: "https://www.argent.xyz/favicon.ico",
      name: "Argent Web Wallet",
      version: "1.0.0",
    },
    proxyLink,
  )

  if (iframeProps) {
    const { iframe, modal } = iframeProps
    proxyLink.updateModal.subscribe(undefined, {
      onData(modalEvent: ModalEvents) {
        switch (modalEvent.action) {
          case "show":
            showModal(modal)
            break
          case "hide":
            hideModal(modal)
            break
          case "updateHeight":
            setIframeHeight(iframe, modalEvent.height)
            break
          case "updateWidth":
            setIframeWidth(iframe, modalEvent.width)
            break
          case "updateSize":
            setIframeSize(iframe, modalEvent.width, modalEvent.height)
            break
        }
      },
    })
  }

  return starknetWindowObject
}
