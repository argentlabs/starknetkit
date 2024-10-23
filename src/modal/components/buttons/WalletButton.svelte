<script lang="ts">
  import LargeButton from "./LargeButton.svelte";

  export let wallet: { title: string, subtitle?: string, icon: string } // TODO

  const isSvg = wallet?.icon?.startsWith("<svg")
</script>

<LargeButton as="a" href="#TODO">
  <div class="w-full flex flex-row-reverse justify-between">
    <div class="flex flex-grow flex-col justify-center items-center">
      <div class="ml-[-32px]">
        <p class="font-semibold text-[15px] text-primary">
          {wallet.title}
        </p>
        {#if wallet.subtitle}
          <p class="text-l2 text-subtle" style="text-align: center;">
            {wallet.subtitle}
          </p>
        {/if}
      </div>
    </div>

    {#if isSvg}
      <div class="flex flex-shrink items-center max-w-[32px]" style="position: relative;">{@html wallet.icon}</div>
    {/if}
  </div>
</LargeButton>
