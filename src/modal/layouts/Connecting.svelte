<script lang="ts">
  import FallbackMobile from "../components/FallbackMobile.svelte";

  export let walletName: string = ""
  export let showFallback: boolean = false
  export let handleFallback: () => void = async () => {}
</script>

<section class="flex flex-col justify-center items-center flex-grow">

  <div  class="flex flex-col h-full justify-center items-center gap-4 w-full flex-grow">
    <div class="bg-button-secondary rounded-full p-5">
      <slot />
    </div>

    <h3 class="text-primary text-h4 font-bold">Connecting to {walletName}...</h3>
  </div>

  {#if showFallback}
    <FallbackMobile handleClick={handleFallback} />
  {/if}
</section>