import { getDevice } from "./getDevice"
import Modal from "../../../../modal/Modal.svelte"
import { Layout, ModalWallet } from "../../../../types/modal"
import { getModalTarget } from "../../../../helpers/modal"
import { StarknetkitConnector } from "../../../connector"

const device = getDevice()

export interface RequestArguments {
  method: string
  params?: unknown[] | object
}

const overlayStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  right: "0",
  bottom: "0",
  backgroundColor: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(10px)",
  zIndex: "9999",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  color: "white",
  fontWeight: "500",
  fontFamily: "'Barlow', sans-serif",
}

const iframeStyle = {
  width: "840px",
  height: "540px",
  zIndex: "99999",
  backgroundColor: "white",
  border: "none",
  outline: "none",
  borderRadius: "40px",
  boxShadow: "0px 4px 40px 0px rgb(0 0 0), 0px 4px 8px 0px rgb(0 0 0 / 25%)",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
}

const iframeStyleOnlyQR = {
  width: "245px",
  height: "245px",
  borderRadius: "40px",
  zIndex: "99999",
  backgroundColor: "white",
  border: "none",
  outline: "none",
}

// TODO - SK-47 - remove this
const overlayHtml = `
  <div id="argent-mobile-modal-container" style="position: relative">
    <iframe class="argent-iframe" allow="clipboard-write"></iframe>
    <div class="argent-close-button" style="position: absolute; top: 24px; right: 24px; cursor: pointer;">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#F5F3F0"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2462 9.75382C22.7018 10.2094 22.7018 10.9481 22.2462 11.4037L17.6499 16L22.2462 20.5963C22.7018 21.0519 22.7018 21.7906 22.2462 22.2462C21.7905 22.7018 21.0519 22.7018 20.5962 22.2462L16 17.6499L11.4039 22.246C10.9482 22.7017 10.2096 22.7017 9.75394 22.246C9.29833 21.7904 9.29833 21.0517 9.75394 20.5961L14.3501 16L9.75394 11.4039C9.29833 10.9483 9.29833 10.2096 9.75394 9.75396C10.2096 9.29835 10.9482 9.29835 11.4039 9.75396L16 14.3501L20.5962 9.75382C21.0519 9.29821 21.7905 9.29821 22.2462 9.75382Z" fill="#333332"/>
      </svg>
    </div>
  </div>
`

const overlayHtmlOnlyQR = `
  <div id="argent-mobile-modal-container" style="position: relative; display: flex; justify-content: center; align-items: center">
    <iframe class="argent-iframe" allow="clipboard-write"></iframe>
  </div>
`

interface Urls {
  readonly desktop: string
  readonly ios: string
  readonly android: string
}

type ModalWalletExtended = ModalWallet & { dappName: string }

class ArgentModal {
  public bridgeUrl = "https://login.argent.xyz"
  public mobileUrl = "argent://"
  public type: "overlay" | "window" = "overlay"
  public wcUri?: string

  private overlay?: HTMLDivElement
  private popupWindow?: Window
  private closingTimeout?: NodeJS.Timeout
  private standaloneConnectorModal?: Modal

  public showWalletConnectModal(
    wcUri: string,
    modalWallet: ModalWalletExtended,
  ) {
    const wcParam = encodeURIComponent(wcUri)
    const href = encodeURIComponent(window.location.href)

    this.showModal(
      {
        desktop: `${this.bridgeUrl}?wc=${wcParam}&href=${href}&device=desktop&onlyQR=true`,
        ios: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile`,
        android: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile`,
      },
      modalWallet,
    )
  }

  public getWalletConnectQR(wcUri: string) {
    const wcParam = encodeURIComponent(wcUri)
    const href = encodeURIComponent(window.location.href)

    this.getQR({
      desktop: `${this.bridgeUrl}?wc=${wcParam}&href=${href}&device=desktop&onlyQR=true`,
      ios: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile`,
      android: `${this.mobileUrl}app/wc?uri=${wcParam}&href=${href}&device=mobile`,
    })
  }

  private getQR(urls: Urls) {
    const overlay = document.createElement("div")
    const shadow = document.querySelector("#starknetkit-modal-container")

    if (shadow?.shadowRoot) {
      // TODO handle else
      const slot = shadow.shadowRoot.querySelector(".qr-code-slot")

      if (slot) {
        // TODO handle else
        slot.innerHTML = overlayHtmlOnlyQR
        document.body.appendChild(overlay)
        this.overlay = overlay

        const iframe = slot.querySelector("iframe") as HTMLIFrameElement
        iframe.setAttribute("src", urls.desktop)

        for (const [key, value] of Object.entries(iframeStyleOnlyQR)) {
          iframe.style[key as any] = value
        }
      }
    }
  }

  // TODO handle this
  public showApprovalModal(_: RequestArguments): void {
    if (device === "desktop") {
      this.showModalOld({
        desktop: `${this.bridgeUrl}?action=sign`,
        ios: "",
        android: "",
      })
      return
    }
    const href = encodeURIComponent(window.location.href)

    /* 
    //https://docs.walletconnect.com/2.0/web3wallet/mobileLinking?platform=ios#ios-wallet-support
    Additionally when there is a signing request triggered by the dapp it will hit the deep link with an incomplete URI, 
    this should be ignored and not considered valid as it's only used for automatically redirecting the users to approve or reject a signing request.
    */
    this.showModalOld({
      desktop: `${this.bridgeUrl}?action=sign&device=desktop&href=${href}`,
      ios: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
      android: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
    })
  }

  // TODO - SK-47 - remove this
  public closeModal(success?: boolean) {
    const modal = this.standaloneConnectorModal
    if (success) {
      modal?.$set({ layout: Layout.success })
      setTimeout(() => modal?.$destroy(), 3000)
    } else {
      modal?.$set({ layout: Layout.failure })
    }
  }

  private showModal(urls: Urls, modalWallet: ModalWalletExtended) {
    this.standaloneConnectorModal = new Modal({
      target: getModalTarget(),
      props: {
        layout: Layout.qrCode,
        dappName: modalWallet.dappName,
        showBackButton: false,
        selectedWallet: modalWallet,
        callback: async (wallet) => {
          try {
            const connector = wallet?.connector as StarknetkitConnector

            this.standaloneConnectorModal?.$destroy()
            await connector.connect()
          } catch (err) {
            this.standaloneConnectorModal?.$set({ layout: Layout.failure })
          }
        },
      },
    })

    this.getQR(urls)
  }

  // TODO - SK-47 - remove this
  private showModalOld(urls: Urls) {
    clearTimeout(this.closingTimeout)
    if (this.overlay || this.popupWindow) {
      this.close()
    }

    if (device === "android" || device === "ios") {
      const toMobileApp = document.createElement("button")
      toMobileApp.style.display = "none"
      toMobileApp.addEventListener("click", () => {
        window.location.href = urls[device]
      })
      toMobileApp.click()

      return
    }
    if (this.type === "window") {
      const features =
        "menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=840,height=540"
      this.popupWindow =
        window.open(urls.desktop, "_blank", features) || undefined
      return
    }

    // type=overlay, device=desktop
    const overlay = document.createElement("div")
    overlay.innerHTML = overlayHtml
    overlay.id = "argent-mobile-modal-overlay"
    for (const [key, value] of Object.entries(overlayStyle)) {
      overlay.style[key as any] = value
    }
    document.body.appendChild(overlay)
    overlay.addEventListener("click", () => this.closeModal())
    this.overlay = overlay

    const iframe = overlay.querySelector("iframe") as HTMLIFrameElement
    iframe.setAttribute("src", urls.desktop)
    for (const [key, value] of Object.entries(iframeStyle)) {
      iframe.style[key as any] = value
    }

    const closeButton = overlay.querySelector(
      ".argent-close-button",
    ) as HTMLDivElement
    closeButton.addEventListener("click", () => this.closeModal())
  }

  // TODO - SK-47 - remove this
  private close = () => {
    this.overlay?.remove()
    this.popupWindow?.close()
    this.overlay = undefined
    this.popupWindow = undefined
  }
}

export const argentModal = new ArgentModal()
