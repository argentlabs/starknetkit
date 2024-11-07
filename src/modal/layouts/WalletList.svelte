<script lang="ts">
  import { Callback, ModalWallet, Theme } from "../../types/modal"
  import WalletButton from "../components/buttons/WalletButton.svelte"

  export let theme: Theme
  export let callback: Callback = async () => {}
  export let walletList: ModalWallet[]
</script>

<section>
  <ul class="flex flex-col gap-3">
    {#each walletList as wallet}
      <li><WalletButton {wallet} {theme} {callback} /></li>
    {/each}
  </ul>
</section>
