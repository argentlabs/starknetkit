<script lang="ts">
  import LargeButton from "./buttons/LargeButton.svelte";
  import PlayStore from "./icons/brands/PlayStore.svelte";
  import ChromeIcon from "./icons/brands/ChromeIcon.svelte";
  import AppleIcon from "./icons/brands/AppleIcon.svelte";
  import HorizontalLine from "./HorizontalLine.svelte";

  export let walletName: string = ""
  export let handleClick: () => void = () => {}
</script>

<footer class="flex flex-col gap-4">
  <HorizontalLine />

  <p class="text-h5 text-primary">Don't have {walletName}?</p>

  <LargeButton
    handleClick={handleClick}
    handleKeyup={(e) => {
      if (e.key === "Enter") {
        handleClick()
      }
    }}
  >
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