<script lang="ts">
  import type { WalletProvider } from "@starknet-io/get-starknet-core"
  import type { StoreVersion } from "../../../types/modal"

  import AppleIcon from "../../components/icons/brands/AppleIcon.svelte"
  import PlayStore from "../../components/icons/brands/PlayStore.svelte"
  import ChromeIcon from "../../components/icons/brands/ChromeIcon.svelte"
  import EdgeIcon from "../../components/icons/brands/EdgeIcon.svelte"
  import FirefoxIcon from "../../components/icons/brands/FirefoxIcon.svelte"

  import ArgentMobileGraphic from "./graphics/ArgentMobileGraphic.svelte"
  import ArgentXGraphic from "./graphics/ArgentXGraphic.svelte"
  import GeneralizedGraphic from "./graphics/GeneralizedGraphic.svelte"

  import ArgentDownloadItem from "./DownloadWalletItem.svelte"
  import Link from "../../components/buttons/Link.svelte"
  import HorizontalLine from "../../components/HorizontalLine.svelte"

  export let isArgent: boolean = false
  export let extensionId: string = ""
  export let extensionName: string = ""
  export let store: StoreVersion | null
  export let storeLink: string | undefined
  export let discoveryWallets: WalletProvider[]

  const discoveredWallet = discoveryWallets.find((w: WalletProvider) => w.id.toLowerCase() === extensionId.toLowerCase())
  const discoveredWalletDownloads = Object.entries(discoveredWallet?.downloads || {})

  const storeData = {
    // @dev - Be mindful of name property length, it might break the UI
    chrome: {
      name: "Chrome",
      icon: ChromeIcon,
    },
    edge: {
      name: "Edge",
      icon: EdgeIcon,
    },
    firefox: {
      name: "Firefox",
      icon: FirefoxIcon,
    },
  }
</script>

<section class="flex flex-col flex-grow justify-between">
  <div class="flex flex-col gap-2">
    <!--  Upon removal of Argent mobile, remove and code else `!isArgent` if case from line 84  -->
    {#if isArgent}
      <ArgentDownloadItem
        title="Ready mobile"
        subtitle="Download Ready wallet on your mobile."
        link="https://www.argent.xyz/app"
      >
        <svelte:fragment slot="icons">
          <AppleIcon />
          <PlayStore />
        </svelte:fragment>

        <svelte:fragment slot="button">Download</svelte:fragment>

        <svelte:fragment slot="graphic">
          <ArgentMobileGraphic />
        </svelte:fragment>
      </ArgentDownloadItem>
    {/if}

    {#if store && storeLink}
      <ArgentDownloadItem
        title={extensionName}
        subtitle={`Install ${extensionName} extension.`}
        link={storeLink}
      >
        <svelte:fragment slot="button">
          <div class="flex gap-1 items-center whitespace-nowrap">
            <svelte:component this={storeData[store].icon} /> Install for {storeData[
              store
            ].name}
          </div>
        </svelte:fragment>

        <svelte:fragment slot="graphic">
          {#if isArgent}
            <ArgentXGraphic />
          {:else}
            <GeneralizedGraphic />
          {/if}
        </svelte:fragment>
      </ArgentDownloadItem>
    {:else if !isArgent}
      <p class="text-[16px] text-primary">
        <span class="capitalize">{extensionName}</span> is not available on your browser.<br/><br/>
        {#if discoveredWalletDownloads.length > 0}
          Try on other browsers:{" "}
          {#each discoveredWalletDownloads as discovery, i}
            <Link as="a" className="capitalize" href={discovery[1]}>{discovery[0]}</Link>{i + 1 === discoveredWalletDownloads.length ? "." : ", "}
          {/each}
        {/if}
      </p>
    {/if}
  </div>

  <footer class="flex flex-col gap-4">
    {#if isArgent}
      <HorizontalLine />
      <p class="text-[13px] text-secondary">
        If you want to learn more about Ready visit our site:
        <Link as="a" className="text-brand" href="https://www.ready.co/"
          >www.ready.co</Link
        >
      </p>
    {/if}
  </footer>
</section>
