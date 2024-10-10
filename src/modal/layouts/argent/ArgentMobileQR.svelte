<script>
  import InstallWallet from "../../components/InstallWallet.svelte";
  import QRCode from "./QRCode.svelte";
</script>

<section class="flex flex-col gap-4">
  <div>
    <h3 class="mb-4 text-h5 text-primary font-semibold">Connect Argent mobile by<br />scanning QR code:</h3>

    <div class="w-full flex justify-center">
      <!-- TODO replace QR, slot or prop -->
      <QRCode />
    </div>
  </div>

  <InstallWallet walletName="Argent" walletLink="#TODO" />
</section>