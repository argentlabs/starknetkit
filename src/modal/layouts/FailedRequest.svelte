<script lang="ts">
  import WarningIcon from "../components/icons/WarningIcon.svelte";
</script>

<section class="flex flex-col justify-center items-center flex-grow">

  <div  class="flex flex-col h-full justify-center items-center gap-4 w-full flex-grow">
    <div class="bg-button-secondary rounded-full p-5">
      <WarningIcon />
    </div>

    <div>
      <h3 class="text-primary text-h4 font-bold">Couldn't perform the action</h3>
      <p class="text-primary text-p3 font-[400]">Please try again.</p>
    </div>

  </div>
</section>