<script lang="ts">
  import WarningIcon from "../components/icons/WarningIcon.svelte";
  import Button from "../components/buttons/Button.svelte";
  import ReloadIcon from "../components/icons/ReloadIcon.svelte";
  import FallbackMobile from "../components/FallbackMobile.svelte";

  export let walletName: string = ""
  export let showFallback: boolean = false

  export let handleCallback: () => void = async () => {}
  export let handleFallback: () => void = async () => {}
</script>

<section class="flex flex-col justify-center items-center flex-grow">

  <div  class="flex flex-col h-full justify-center items-center gap-4 w-full flex-grow">
    <div class="bg-button-secondary rounded-full p-5">
      <WarningIcon />
    </div>

    <div>
      <h3 class="text-primary text-h4 font-bold">Couldn't connect</h3>
      <p class="text-primary text-p3 font-[400]">Please try connecting again.</p>
    </div>

    <Button
      handleClick={handleCallback}
      handleKeyup={(e) => {
        if (e.key === "Enter") {
          handleCallback()
        }
      }}
      isLarge={true}
    >
      <div class="flex gap-2">
        <ReloadIcon /> Retry connecting to {walletName}
      </div>
    </Button>
  </div>

  {#if showFallback}
    <FallbackMobile handleClick={handleFallback} />
  {/if}
</section>