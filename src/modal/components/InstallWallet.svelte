<script lang="ts">
  import LargeButton from "./buttons/LargeButton.svelte";
  import PlayStore from "./icons/brands/PlayStore.svelte";
  import ChromeIcon from "./icons/brands/ChromeIcon.svelte";
  import AppleIcon from "./icons/brands/AppleIcon.svelte";
  import Line from "./Line.svelte";

  export let walletName: string = ""
  export let walletLink: string = "" // TODO is this link or does it open something else?
</script>

<footer class="flex flex-col gap-4">
  <Line />

  <p class="text-h5 text-primary">Don't have {walletName}?</p>

  <!-- TODO noreferrer noopener, empty href other element, etc -->
  <LargeButton href={walletLink}>
    <div class="flex flex-row-reverse justify-center items-center gap-2">
      <p class="font-semibold text-p3 text-primary">Get it</p>

      <div class="flex gap-3 items-end" style="position: relative;">
        <ChromeIcon />
        <AppleIcon />
        <PlayStore />
      </div>
    </div>
  </LargeButton>
</footer>