<script lang="ts">
  import { getDevice } from "../../../helpers/getDevice"

  import InstallWallet from "../../components/InstallWallet.svelte";

  export const device = getDevice()
  const isMobile = ["android", "ios"].includes(device)

  export let handleInstallClick: () => void = () => {}
</script>

<style>
  @keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      transform: rotate(450deg);
    }
  }

  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(270deg);
    }
  }

  .spinner {
    color: #ff875b;
    animation: rotator 1.4s linear infinite;
  }

  .spinner circle {
    stroke: currentColor;
    stroke-dasharray: 187;
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: dash 1.4s ease-in-out infinite;
  }
</style>

<section class="flex flex-col gap-4">
  <div>
    {#if isMobile}
      <h3 class="mb-4 text-h5 text-primary font-semibold">Connecting to Argent mobile...</h3>
    {:else}
      <h3 class="mb-4 text-h5 text-primary font-semibold">Connect Argent mobile by<br />scanning QR code:</h3>
    {/if}

    <div class="w-full flex justify-center items-center qr-code-slot h-[245px]">
      <!--
        @dev Spinner is replaced after loading by QR code;
        Spinner and styles copied to be exactly the same as in argent-mobile-login,
        since that one will appear once QR code is ready for it's loading state
      -->
      <svg class="spinner" viewBox="0 0 66 66" width="100px" height="100px" xmlns="http://www.w3.org/2000/svg">
        <circle fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30" />
      </svg>
    </div>
  </div>

  <InstallWallet walletName="Argent" handleClick={handleInstallClick} />
</section>