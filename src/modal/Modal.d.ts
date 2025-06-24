import { Callback, Layout, ModalWallet, Theme } from "../types/modal"

declare namespace svelte.JSX {
  interface IntrinsicElements {
    Modal: svelte.JSX.ModalProps
  }
}

interface Modal extends svelte.ComponentType<ModalProps> {}

interface ModalProps {
  dappName?: string
  layout?: Layout
  modalWallets?: ModalWallet[]
  selectedWallet?: ModalWallet | null
  showBackButton?: boolean
  callback?: Callback
  theme?: Theme
  darkModeControlClass?: string
}

interface ModalInstance extends SvelteComponent {
  $set(props: Partial<ModalProps>): void
  $destroy(): void
  getLayout: () => Layout
}
