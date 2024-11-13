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

const iframeStyleOnlyQR = {
  width: "245px",
  height: "245px",
  borderRadius: "40px",
  zIndex: "99999",
  backgroundColor: "white",
  border: "none",
  outline: "none",
}

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
      const slot = shadow.shadowRoot.querySelector(".qr-code-slot")

      if (slot) {
        slot.innerHTML = overlayHtmlOnlyQR
        document.body.appendChild(overlay)
        this.overlay = overlay

        const iframe = slot.querySelector("iframe") as HTMLIFrameElement
        iframe.setAttribute("src", urls.desktop)

        for (const [key, value] of Object.entries(iframeStyleOnlyQR)) {
          iframe.style[key as any] = value
        }
      } else {
        throw new Error("Cannot find QR code slot")
      }
    } else {
      throw new Error("Cannot find modal")
    }
  }

  public showApprovalModal(_: RequestArguments): void {
    if (device === "desktop") {
      this.getModal(undefined, Layout.approval)
      return
    }
    const href = encodeURIComponent(window.location.href)
    /*
    //https://docs.walletconnect.com/2.0/web3wallet/mobileLinking?platform=ios#ios-wallet-support
    Additionally when there is a signing request triggered by the dapp it will hit the deep link with an incomplete URI,
    this should be ignored and not considered valid as it's only used for automatically redirecting the users to approve or reject a signing request.
    */
    this.showModal(
      {
        desktop: `${this.bridgeUrl}?action=sign&device=desktop&href=${href}`,
        ios: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
        android: `${this.mobileUrl}app/wc/request?href=${href}&device=mobile`,
      },
      undefined,
    )
  }

  public closeModal(success?: boolean) {
    const modal = this.standaloneConnectorModal
    if (success) {
      modal?.$set({ layout: Layout.success })
      setTimeout(() => modal?.$destroy(), 500)
    } else {
      modal?.$set({ layout: Layout.failure })
    }
  }

  private getModal(
    modalWallet?: ModalWalletExtended,
    modalLayout: Layout = Layout.qrCode,
  ) {
    this.standaloneConnectorModal = new Modal({
      target: getModalTarget(),
      props: {
        layout: modalLayout,
        dappName: modalWallet?.dappName,
        showBackButton: false,
        selectedWallet: modalWallet,
        callback: async (wallet: ModalWallet | null) => {
          try {
            const connector = wallet?.connector as StarknetkitConnector

            this.standaloneConnectorModal?.$destroy()
            await connector?.connect()
          } catch (err) {
            this.standaloneConnectorModal?.$set({ layout: Layout.failure })
          }
        },
      },
    })
  }

  private showModal(urls: Urls, modalWallet?: ModalWalletExtended) {
    this.getModal(modalWallet, Layout.qrCode)

    this.getQR(urls)
  }
}

export const argentModal = new ArgentModal()
