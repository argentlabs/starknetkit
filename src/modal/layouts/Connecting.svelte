<script lang="ts">
  import FallbackMobile from "../components/FallbackMobile.svelte";

  export let extensionName: string = "Argent X"
  export let showFallback: boolean = true
</script>

<section class="flex flex-col justify-center items-center flex-grow">

  <div  class="flex flex-col h-full justify-center items-center gap-4 w-full flex-grow">
    <div class="bg-button-secondary rounded-full p-5">
      <slot />
    </div>

    <h3 class="text-primary text-h4 font-bold">Connecting to {extensionName}...</h3>
  </div>

  {#if showFallback}
    <FallbackMobile />
  {/if}
</section>