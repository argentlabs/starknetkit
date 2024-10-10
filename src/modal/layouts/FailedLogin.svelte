<script lang="ts">
  import WarningIcon from "../components/icons/WarningIcon.svelte";
  import Button from "../components/buttons/Button.svelte";
  import ReloadIcon from "../components/icons/ReloadIcon.svelte";
  import FallbackMobile from "../components/FallbackMobile.svelte";

  export let extensionName: string = "Argent X"
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

    <Button isLarge={true}>
      <div class="flex gap-2">
        <ReloadIcon /> Retry connecting to {extensionName}
      </div>
    </Button>
  </div>

  <FallbackMobile />
</section>