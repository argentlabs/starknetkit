<script lang="ts">
  import { StoreVersion } from "../../../types/modal"

  import ChromeIcon from "../../components/icons/brands/ChromeIcon.svelte";
  import FirefoxIcon from "../../components/icons/brands/FirefoxIcon.svelte";
  import EdgeIcon from "../../components/icons/brands/EdgeIcon.svelte";
  import BraveIcon from "../../components/icons/brands/BraveIcon.svelte";
  import ExtensionDownloadItem from "./ExtensionDownloadItem.svelte";

  export let extensionName: string = ""

  export let downloadLinks: Record<StoreVersion, "" | undefined> | undefined = {
    chrome: "",
    edge: "",
    firefox: "",
  }
</script>

<section>
  {#if downloadLinks}
    <ul class="flex flex-col gap-3">
      {#if downloadLinks.chrome}
        <ExtensionDownloadItem href={downloadLinks.chrome} {extensionName} browser="Google Chrome"><ChromeIcon size="28" /></ExtensionDownloadItem>
      {/if}
      {#if downloadLinks.firefox}
        <ExtensionDownloadItem href={downloadLinks.firefox} {extensionName} browser="Mozilla Firefox"><FirefoxIcon size="28" /></ExtensionDownloadItem>
      {/if}
      {#if downloadLinks.edge}
        <ExtensionDownloadItem href={downloadLinks.edge} {extensionName} browser="Edge"><EdgeIcon size="28" /></ExtensionDownloadItem>
      {/if}
      {#if downloadLinks.chrome}
        <ExtensionDownloadItem href={downloadLinks.chrome} {extensionName} browser="Brave"><BraveIcon size="28" /></ExtensionDownloadItem>
      {/if}
    </ul>
  {/if}
</section>