<script lang="ts">
  import { onMount } from "svelte"

  import {
    type Callback,
    Layout,
    type ModalWallet,
    type Theme,
  } from "../types/modal"

  import Header from "./components/Header.svelte"
  import WalletList from "./layouts/WalletList.svelte"
  import Connecting from "./layouts/Connecting.svelte"
  import ArgentMobileApproval from "./layouts/argent/ArgentMobileApproval.svelte"
  import ArgentMobileQR from "./layouts/argent/ArgentMobileQR.svelte"
  import FailedLogin from "./layouts/FailedLogin.svelte"
  import Success from "./layouts/Success.svelte"
  import DownloadWallet from "./layouts/DownloadWallet/DownloadWallet.svelte"
  import DynamicIcon from "./components/DynamicIcon.svelte"

  import { isInArgentMobileAppBrowser } from "../connectors/argent/helpers"
  import { extractConnector, isCompoundConnector } from "../helpers/connector"
  import type { StarknetkitCompoundConnector } from "../connectors"
  import { ArgentX } from "../connectors/injected/argentX"
  import { Braavos } from "../connectors/injected/braavos"
  import { getModalWallet } from "../helpers/mapModalWallets"
  import { getStoreVersionFromBrowser } from "../helpers/getStoreVersionFromBrowser"
  import FailedRequest from "./layouts/FailedRequest.svelte"

  let nodeRef: HTMLElement | undefined

  export let dappName: string = window?.document.title ?? ""

  export let layout: Layout = Layout.walletList
  function setLayout(newLayout: Layout): void {
    layout = newLayout
  }
  export function getLayout() {
    return layout
  }

  export let modalWallets: ModalWallet[] = []
  export let selectedWallet: ModalWallet | null = null
  $: selectedConnector =
    selectedWallet?.connector && extractConnector(selectedWallet.connector)

  export let showBackButton: boolean = true
  $: showFallback = Boolean(
    selectedWallet &&
      isCompoundConnector(selectedWallet?.connector) &&
      (selectedWallet?.connector as StarknetkitCompoundConnector)
        ?.fallbackConnector,
  )

  export let callback: Callback = async () => {}

  let isInAppBrowser = isInArgentMobileAppBrowser()

  export let theme: Theme = "dark"
  export let darkModeControlClass = (theme === "dark" ? "dark" : "") as Theme

  onMount(async () => {
    if (
      theme === "dark" ||
      (theme == undefined &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      darkModeControlClass = "dark"
    } else {
      darkModeControlClass = "light"
    }

    if (isInAppBrowser) {
      try {
        setTimeout(() => {
          void callback(getModalWallet(new ArgentX()))
        })
      } catch (e) {
        console.error(e)
      }
      return
    }

    const isBraavosMobileApp =
      navigator?.userAgent?.toLowerCase()?.includes("braavos") &&
      window?.starknet_braavos

    if (isBraavosMobileApp) {
      try {
        setTimeout(() => {
          void callback(getModalWallet(new Braavos()))
        })
      } catch (e) {
        console.error(e)
      }
      return
    }

    if (modalWallets.length === 1) {
      try {
        await callback(modalWallets[0])
      } catch (e) {
        console.error(e)
      }
    }
  })
</script>

{#if !isInAppBrowser && (layout === Layout.walletList ? modalWallets.length > 1 : true)}
  <div
    bind:this={nodeRef}
    part="starknetkit-modal"
    class={`${darkModeControlClass} modal-font fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-sm bg-black/25`}
  >
    <main
      role="dialog"
      class={`
        rounded-3xl bg-surface-default shadow-modal dark:shadow-none flex flex-col
        z-[9999] w-full max-w-[380px] mx-6 p-6 text-center gap-8
        ${layout !== Layout.walletList ? "min-h-[570px]" : ""}
      `}
    >
      <Header
        handleBack={() => setLayout(Layout.walletList)}
        handleClose={() => nodeRef?.parentNode?.removeChild(nodeRef)}
        title={dappName}
        showBackButton={showBackButton &&
          ![Layout.walletList, Layout.success].includes(layout)}
      />

      {#if layout === Layout.walletList}
        <WalletList
          walletList={modalWallets}
          theme={darkModeControlClass}
          {callback}
        />
      {:else if layout === Layout.connecting}
        <Connecting
          walletName={selectedConnector?.name}
          {showFallback}
          handleFallback={() => callback(selectedWallet, true)}
        >
          {#if selectedConnector?.icon}
            <DynamicIcon
              icon={selectedConnector.icon}
              theme={darkModeControlClass}
            />
          {/if}
        </Connecting>
      {:else if layout === Layout.success}
        <Success />
      {:else if layout === Layout.loginFailure}
        <FailedLogin
          walletName={selectedConnector?.name}
          handleCallback={() => callback(selectedWallet)}
          {showFallback}
          handleFallback={() => callback(selectedWallet, true)}
        />
      {:else if layout === Layout.requestFailure}
        <FailedRequest />
      {:else if layout === Layout.qrCode}
        <ArgentMobileQR handleInstallClick={() => setLayout(Layout.download)} />
      {:else if layout === Layout.approval}
        <ArgentMobileApproval />
      {:else if layout === Layout.download}
        <DownloadWallet
          store={getStoreVersionFromBrowser()}
          isArgent={Boolean(
            selectedConnector &&
              (selectedConnector?.id === "argentMobile" ||
                selectedConnector?.id === "argentX"),
          )}
          storeLink={selectedWallet?.download}
          extensionName={selectedWallet?.name === "Argent"
            ? "Ready Wallet (formerly Argent)"
            : selectedConnector?.name}
        />
      {/if}
    </main>
  </div>
{/if}
