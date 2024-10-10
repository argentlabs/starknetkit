<script>
  import ChromeIcon from "../../components/icons/brands/ChromeIcon.svelte";
  import FirefoxIcon from "../../components/icons/brands/FirefoxIcon.svelte";
  import EdgeIcon from "../../components/icons/brands/EdgeIcon.svelte";
  import BraveIcon from "../../components/icons/brands/BraveIcon.svelte";
  import ExtensionDownloadItem from "./ExtensionDownloadItem.svelte";
</script>

<section>
    <ul class="flex flex-col gap-3">
        <ExtensionDownloadItem href="#TODO" browser="Google Chrome"><ChromeIcon size="28" /></ExtensionDownloadItem>
        <ExtensionDownloadItem href="#TODO" browser="Mozilla Firefox"><FirefoxIcon size="28" /></ExtensionDownloadItem>
        <ExtensionDownloadItem href="#TODO" browser="Google Chrome"><EdgeIcon size="28" /></ExtensionDownloadItem>
        <ExtensionDownloadItem href="#TODO" browser="Google Chrome"><BraveIcon size="28" /></ExtensionDownloadItem>
    </ul>
</section>