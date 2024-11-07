<script lang="ts">
  import { Callback, ModalWallet, Theme } from "../../../types/modal"

  import LargeButton from "./LargeButton.svelte";
  import DynamicIcon from "../DynamicIcon.svelte"

  export let wallet: ModalWallet
  export let theme: Theme

  export let callback: Callback = async () => {}
</script>

<LargeButton
  handleClick={() => callback(wallet)}
  handleKeyup={(e) => {
    if (e.key === "Enter") {
      callback(wallet)
    }
  }}
>
  <div class="w-full flex flex-row-reverse justify-between">
    <div class="flex flex-grow flex-col justify-center items-center">
      <div class="ml-[-32px]">
        <p class="font-semibold text-[15px] text-primary">
          {wallet.title ?? wallet.name}
        </p>
        {#if wallet.subtitle}
          <p class="text-l2 text-subtle" style="text-align: center;">
            {wallet.subtitle}
          </p>
        {/if}
      </div>
    </div>

    <DynamicIcon icon={wallet.icon} theme={theme} />
  </div>
</LargeButton>
