<script lang="ts">
  import WalletButton from "../components/buttons/WalletButton.svelte"

  export let walletList: { title: string, subtitle?: string, icon: string }[] // TODO type
</script>

<section>
  <ul class="flex flex-col gap-3">
    {#each walletList as wallet}
      <li><WalletButton {wallet} /></li>
    {/each}
  </ul>
</section>
