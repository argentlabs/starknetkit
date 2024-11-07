<script lang="ts">
  import AppleIcon from "../../../components/icons/brands/AppleIcon.svelte";
  import PlayStore from "../../../components/icons/brands/PlayStore.svelte";
  import ChromeIcon from "../../../components/icons/brands/ChromeIcon.svelte";
  import FirefoxIcon from "../../../components/icons/brands/FirefoxIcon.svelte";
  import EdgeIcon from "../../../components/icons/brands/EdgeIcon.svelte";
  import BraveIcon from "../../../components/icons/brands/BraveIcon.svelte";

  import MobileGraphic from "./graphics/MobileGraphic.svelte";
  import ArgentXGraphic from "./graphics/ArgentXGraphic.svelte";

  import ArgentDownloadItem from "./ArgentDownloadItem.svelte";
  import Link from "../../../components/buttons/Link.svelte";
  import HorizontalLine from "../../../components/HorizontalLine.svelte";

  export let showInstallExtension: boolean = false

  export let handleExtensionClick: () => void = () => {}
</script>

<section class="flex flex-col flex-grow justify-between">
  <div class="flex flex-col gap-2">
    <ArgentDownloadItem title="Argent mobile" subtitle="Download Argent wallet on your mobile." link="https://www.argent.xyz/app">
      <svelte:fragment slot="icons">
        <AppleIcon />
        <PlayStore />
      </svelte:fragment>

      <svelte:fragment slot="graphic">
        <MobileGraphic />
      </svelte:fragment>
    </ArgentDownloadItem>

    {#if showInstallExtension}
      <ArgentDownloadItem title="Argent X" subtitle="Install Argent extension." handleClick={handleExtensionClick}>
        <svelte:fragment slot="icons">
          <ChromeIcon />
          <FirefoxIcon />
          <EdgeIcon />
          <BraveIcon />
        </svelte:fragment>

        <svelte:fragment slot="graphic">
          <ArgentXGraphic />
        </svelte:fragment>
      </ArgentDownloadItem>
    {/if}
  </div>

  <footer class="flex flex-col gap-4">
    <HorizontalLine />
    <p class="text-[13px] text-secondary">If you want to learn more about argent visit our site:
      <Link as="a" className="text-brand" href="https://www.argent.xyz/">www.argent.xyz</Link>
    </p>
  </footer>
</section>