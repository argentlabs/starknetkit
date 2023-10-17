<script lang="ts">
  import type { StarknetWindowObject } from "get-starknet-core"
  import sn from "get-starknet-core"
  import { onMount } from "svelte"
  import ConnectorButton from "./ConnectorButton.svelte"
  import type { ModalWallet } from "../types/modal"
  import type { Connector } from "../connectors/connector"

  export let dappName: string = window?.document.title ?? ""
  export let modalWallets: ModalWallet[]
  export let callback: (
    value: StarknetWindowObject | null,
  ) => Promise<void> = async () => {}
  export let theme: "light" | "dark" | null = null

  let loadingItem: string | false = false
  let emailOnly =
    modalWallets.length === 1 &&
    modalWallets[0].id.toLowerCase().includes("webwallet")

  let starknetMobile = window?.starknet_argentX as StarknetWindowObject & {
    isInAppBrowser: boolean
  }
  let isInAppBrowser = starknetMobile?.isInAppBrowser

  const setLoadingItem = (item: string | false) => {
    loadingItem = item
  }

  let cb = async (connector: Connector | null) => {
    setLoadingItem(connector?.id ?? false)
    try {
      await connector?.connect()
      await callback(connector?.wallet ?? null)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingItem(false)
    }
  }

  let darkModeControlClass = theme === "dark" ? "dark" : ""
  onMount(async () => {
    if (
      theme === "dark" ||
      (theme === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      darkModeControlClass = "dark"
    } else {
      darkModeControlClass = ""
    }

    if (isInAppBrowser) {
      try {
        const enabledValue = await sn.enable(window?.starknet_argentX)
        callback(enabledValue ?? window?.starknet_argentX)
      } catch {}
      return
    }

    if (emailOnly) {
      try {
        const [wallet] = modalWallets
        await wallet.connector?.connect()
        callback(wallet.connector.wallet)
      } catch (e) {
        console.error(e)
      }
    }
  })
</script>

{#if !isInAppBrowser && !emailOnly}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class={`modal-font backdrop-blur-sm fixed inset-0 flex items-center 
            justify-center bg-black/25 z-[9999] ${darkModeControlClass}`}
    on:click={() => cb(null)}
    on:keyup={(e) => {
      if (e.key === "Escape") {
        cb(null)
      }
    }}
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <main
      role="dialog"
      class={`rounded-3xl shadow-modal dark:shadow-none 
              w-full max-w-[380px] z-50 
              mx-6 p-6 pb-8 text-center 
              bg-slate-50 dark:bg-neutral-900 
            text-neutral-900 dark:text-white`}
      on:click={(e) => e.stopPropagation()}
      on:keyup={(e) => {
        e.stopPropagation()
      }}
    >
      <header class={`flex items-center justify-center flex-col mb-2 relative`}>
        <h2 class="text-sm text-gray-400 font-semibold">Connect to</h2>
        <h1
          class={`text-xl font-semibold mb-6 
                  max-w-[240px] overflow-hidden 
                  whitespace-nowrap text-ellipsis`}
        >
          {dappName}
        </h1>
        <span
          class={`absolute top-0 right-0 p-2 cursor-pointer
                  rounded-full bg-neutral-100 dark:bg-neutral-800
                  text-neutral-400 dark:text-white
                  hover:bg-neutral-100 dark:hover:bg-neutral-700
                  focus:outline-none focus:ring-2
                focus:ring-neutral-200 dark:focus:ring-neutral-700
                  transition-colors`}
          role="button"
          tabindex="0"
          aria-label="Close"
          on:click={() => cb(null)}
          on:keyup={(e) => {
            if (e.key === "Enter") {
              cb(null)
            }
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.77275 3.02275C9.99242 2.80308 9.99242 2.44692 9.77275 2.22725C9.55308 2.00758 9.19692 2.00758 8.97725 2.22725L6 5.20451L3.02275 2.22725C2.80308 2.00758 2.44692 2.00758 2.22725 2.22725C2.00758 2.44692 2.00758 2.80308 2.22725 3.02275L5.20451 6L2.22725 8.97725C2.00758 9.19692 2.00758 9.55308 2.22725 9.77275C2.44692 9.99242 2.80308 9.99242 3.02275 9.77275L6 6.79549L8.97725 9.77275C9.19692 9.99242 9.55308 9.99242 9.77275 9.77275C9.99242 9.55308 9.99242 9.19692 9.77275 8.97725L6.79549 6L9.77275 3.02275Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </header>

      <ul class="flex flex-col gap-3">
        {#each modalWallets as wallet}
          <ConnectorButton {wallet} {loadingItem} {cb} />
        {/each}
      </ul>
    </main>
  </div>
{/if}

<!-- <style>
  @tailwind utilities;
  @tailwind components;
  @tailwind base;

  @import url("https://fonts.googleapis.com/css2?family=Barlow:wght@500;600&display=swap");

  .modal-font {
    font-family: "Barlow", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
      Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    text-size-adjust: 100%;
    font-feature-settings: "kern";
  }
</style>
 -->
