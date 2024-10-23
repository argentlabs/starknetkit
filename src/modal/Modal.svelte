<script lang="ts">
  // import { onMount } from "svelte"
  // import type { StarknetWindowObject } from "@starknet-io/types-js"
  // import ConnectorButton from "./ConnectorButton.svelte"
  // import type { StarknetkitConnector } from "../connectors/connector"
  // import { InjectedConnector } from "../connectors/injected"
  // import { ArgentX } from "../connectors/injected/argentX"
  // import { isInArgentMobileAppBrowser } from "../connectors/argent/helpers"
  // import { getConnector } from "../main"
  import { ModalWallet } from "../types/modal"

  import Header from "./components/Header.svelte"
  import FailedLogin from "./layouts/FailedLogin.svelte"

  export let dappName: string = window?.document.title ?? ""
  export let modalWallets: ModalWallet[]
  console.log(modalWallets)
  // export let callback: (
  //   value: StarknetkitConnector | null,
  // ) => Promise<void> = async () => {}
  // export let theme: "light" | "dark" | null = null
  //
  // let loadingItem: string | false = false
  //
  // let isInAppBrowser = isInArgentMobileAppBrowser()
  //
  // const setLoadingItem = (item: string | false) => {
  //   loadingItem = item
  // }

  // let cb = async (connector: StarknetkitConnector | null) => {
  //   setLoadingItem(connector?.id ?? false)
  //   try {
  //     await callback(connector ?? null)
  //   } finally {
  //     setLoadingItem(false)
  //   }
  // }

  export const darkModeControlClass = "light"
  // let darkModeControlClass = theme === "dark" ? "dark" : ""
  // onMount(async () => {
  //   // if (
  //   //   theme === "dark" ||
  //   //   (theme === null &&
  //   //     window.matchMedia("(prefers-color-scheme: dark)").matches)
  //   // ) {
  //   //   darkModeControlClass = "dark"
  //   // } else {
  //   //   darkModeControlClass = ""
  //   // }
  //
  //   // if (isInAppBrowser) { TODO ??
  //   //   try {
  //   //     callback(new ArgentX())
  //   //   } catch {}
  //   //   return
  //   // }
  //
  //   if (modalWallets.length === 1) {
  //     try {
  //       await callback(getConnector(modalWallets[0].connector))
  //     } catch (e) {
  //       console.error(e)
  //     }
  //   }
  // })

  export let fixedHeight = true
  export let showBackButton = true
</script>

<div part="starknetkit-modal"
     class={`
    ${darkModeControlClass} modal-font fixed inset-0 z-[9998] flex items-center justify-center backdrop-blur-sm bg-black/25
  `}>
  <main role="dialog"
        class={`
      rounded-3xl bg-surface-default shadow-modal dark:shadow-none flex flex-col
      z-[9999] w-full max-w-[380px] mx-6 p-6 text-center gap-8
      ${fixedHeight ? "min-h-[570px]" : ""}
    `}
  >
    <Header title={dappName} showBackButton={showBackButton} />

    <!--			<WalletList {walletList} />-->
    <!--			<ArgentMobileQR />-->
    <!--			<ArgentDownload />-->
    <!--			<ExtensionDownloadList />-->
    <!--			<SuccessfulLogin />-->
          <FailedLogin />
    <!--			<Connecting>-->
    <!--				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="41" viewBox="0 0 40 41" fill="none">-->
    <!--					<path d="M23.813 6.46613H16.1191C15.862 6.46613 15.656 6.68535 15.6504 6.95784C15.495 14.6174 11.7148 21.8872 5.2082 27.0365C5.00163 27.1999 4.95457 27.507 5.10559 27.7282L9.60718 34.3265C9.76032 34.5511 10.0587 34.6018 10.2687 34.4368C14.3371 31.2382 17.6095 27.3795 19.9661 23.1025C22.3227 27.3795 25.5952 31.2382 29.6636 34.4368C29.8735 34.6018 30.1719 34.5511 30.3252 34.3265L34.8268 27.7282C34.9776 27.507 34.9306 27.1999 34.7242 27.0365C28.2174 21.8872 24.4372 14.6174 24.2819 6.95784C24.2763 6.68535 24.0702 6.46613 23.813 6.46613Z" fill="black"/>-->
    <!--					<path d="M34.5894 11.2863L33.7628 8.71579C33.5947 8.19392 33.1852 7.78742 32.664 7.6267L30.0981 6.83257C29.744 6.72289 29.7402 6.219 30.0934 6.10461L32.6461 5.27265C33.1646 5.10343 33.5694 4.69029 33.7291 4.16653L34.517 1.5837C34.626 1.22634 35.1266 1.22255 35.2412 1.57804L36.0677 4.14856C36.2358 4.67043 36.6453 5.07695 37.1665 5.23862L39.7324 6.0318C40.0865 6.14148 40.0903 6.64537 39.7372 6.76071L37.1844 7.59267C36.6659 7.76094 36.2611 8.17408 36.1015 8.69879L35.3135 11.2807C35.2045 11.638 34.7039 11.6418 34.5894 11.2863Z" fill="black"/>-->
    <!--				</svg>-->
    <!--			</Connecting>-->

  </main>
</div>

<!--{#if !isInAppBrowser && modalWallets.length > 1}-->
<!--  &lt;!&ndash; svelte-ignore a11y-no-static-element-interactions &ndash;&gt;-->
<!--  <div-->
<!--    part="starknetkit-modal"-->
<!--    class={`modal-font backdrop-blur-sm fixed inset-0 flex items-center-->
<!--            justify-center bg-black/25 z-[9999] ${darkModeControlClass}`}-->
<!--    on:click={() => cb(null)}-->
<!--    on:keyup={(e) => {-->
<!--      if (e.key === "Escape") {-->
<!--        cb(null)-->
<!--      }-->
<!--    }}-->
<!--  >-->
<!--    &lt;!&ndash; svelte-ignore a11y-no-noninteractive-element-interactions &ndash;&gt;-->
<!--    <main-->
<!--      role="dialog"-->
<!--      class={`rounded-3xl shadow-modal dark:shadow-none-->
<!--              w-full max-w-[380px] z-50-->
<!--              mx-6 p-6 pb-8 text-center-->
<!--              bg-slate-50 dark:bg-neutral-900-->
<!--            text-neutral-900 dark:text-white`}-->
<!--      on:click={(e) => e.stopPropagation()}-->
<!--      on:keyup={(e) => {-->
<!--        e.stopPropagation()-->
<!--      }}-->
<!--    >-->
<!--      <header class={`flex items-center justify-center flex-col mb-2 relative`}>-->
<!--        <h2 class="text-sm text-gray-400 font-semibold">Connect to</h2>-->
<!--        <h1-->
<!--          class={`text-xl font-semibold mb-6-->
<!--                  max-w-[240px] overflow-hidden-->
<!--                  whitespace-nowrap text-ellipsis`}-->
<!--        >-->
<!--          {dappName}-->
<!--        </h1>-->
<!--        <span-->
<!--          class={`absolute top-0 right-0 p-2 cursor-pointer-->
<!--                  rounded-full bg-neutral-100 dark:bg-neutral-800-->
<!--                  text-neutral-400 dark:text-white-->
<!--                  hover:bg-neutral-100 dark:hover:bg-neutral-700-->
<!--                  focus:outline-none focus:ring-2-->
<!--                focus:ring-neutral-200 dark:focus:ring-neutral-700-->
<!--                  transition-colors`}-->
<!--          role="button"-->
<!--          tabindex="0"-->
<!--          aria-label="Close"-->
<!--          on:click={() => cb(null)}-->
<!--          on:keyup={(e) => {-->
<!--            if (e.key === "Enter") {-->
<!--              cb(null)-->
<!--            }-->
<!--          }}-->
<!--        >-->
<!--          <svg-->
<!--            width="12"-->
<!--            height="12"-->
<!--            viewBox="0 0 12 12"-->
<!--            fill="none"-->
<!--            xmlns="http://www.w3.org/2000/svg"-->
<!--          >-->
<!--            <path-->
<!--              d="M9.77275 3.02275C9.99242 2.80308 9.99242 2.44692 9.77275 2.22725C9.55308 2.00758 9.19692 2.00758 8.97725 2.22725L6 5.20451L3.02275 2.22725C2.80308 2.00758 2.44692 2.00758 2.22725 2.22725C2.00758 2.44692 2.00758 2.80308 2.22725 3.02275L5.20451 6L2.22725 8.97725C2.00758 9.19692 2.00758 9.55308 2.22725 9.77275C2.44692 9.99242 2.80308 9.99242 3.02275 9.77275L6 6.79549L8.97725 9.77275C9.19692 9.99242 9.55308 9.99242 9.77275 9.77275C9.99242 9.55308 9.99242 9.19692 9.77275 8.97725L6.79549 6L9.77275 3.02275Z"-->
<!--              fill="currentColor"-->
<!--            />-->
<!--          </svg>-->
<!--        </span>-->
<!--      </header>-->

<!--      <ul class="flex flex-col gap-3">-->
<!--        {#each modalWallets as wallet}-->
<!--          <ConnectorButton {wallet} {loadingItem} {cb} {theme} />-->
<!--        {/each}-->
<!--      </ul>-->
<!--    </main>-->
<!--  </div>-->
<!--{/if}-->
