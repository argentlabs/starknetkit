<script lang="ts">
  import type { ModalWallet } from "../types/modal"
  import type { Connector } from "../connectors/connector"

  export let wallet: ModalWallet
  export let theme: "light" | "dark" | null = null
  export let cb: (value: Connector | null) => Promise<void> = async () => {}
  export let loadingItem: string | false = false
  const icon = theme === "dark" ? wallet.icon.dark : wallet.icon.light
  const isSvg = icon?.startsWith("<svg")
</script>

{#if wallet.download}
  <a
    aria-label={wallet.name + " download link"}
    href={wallet.download}
    target="_blank"
    rel="noopener noreferrer"
    class={`rounded-md focus:outline-none  focus:ring-2 
    focus:ring-neutral-200  dark:focus:ring-neutral-700 transition-colors`}
  >
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <li
      class={`flex flex-row-reverse justify-between items-center 
              p-3 rounded-md cursor-pointer shadow-list-item 
              dark:shadow-none dark:bg-neutral-800 dark:text-white 
            hover:bg-neutral-100 dark:hover:bg-neutral-700`}
      on:click={() => {
        cb(null)
      }}
      on:keyup={(e) => {
        if (e.key === "Enter") {
          cb(null)
        }
      }}
    >
      <span class="w-8 h-8" />
      <p class="font-semibold text-base p">
        Install {wallet.name}
      </p>
      <img alt={wallet.name} src={icon} class="w-8 h-8 rounded-full" />
    </li>
  </a>
{:else}
  <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
  <li
    class={`flex flex-row-reverse justify-between items-center 
            p-3 rounded-md cursor-pointer shadow-list-item 
            dark:shadow-none dark:bg-neutral-800 dark:text-white 
          hover:bg-neutral-100 dark:hover:bg-neutral-700 
          focus:outline-none focus:ring-2 
        focus:ring-neutral-200 dark:focus:ring-neutral-700 
          transition-colors`}
    role="button"
    tabindex="0"
    on:click={async () => {
      cb(wallet.connector)
    }}
    on:keyup={async (e) => {
      if (e.key === "Enter") {
        cb(wallet.connector)
      }
    }}
  >
    <span class="w-8 h-8" />
    <div class="flex flex-col justify-center items-center">
      <p class="font-semibold text-base p">
        {wallet.title ?? wallet.name}
      </p>
      <p class="l2 p" style="text-align: center;">
        {wallet.subtitle ?? ""}
      </p>
    </div>

    {#if loadingItem === wallet?.id}
      <div role="status">
        <svg
          aria-hidden="true"
          class="w-8 h-8 text-neutral-300 animate-spin dark:text-neutral-600 fill-neutral-600 dark:fill-neutral-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    {:else if isSvg}
      <div style="position: relative;">{@html icon}</div>
    {:else}
      <img alt={wallet?.name} src={icon} class="w-8 h-8 rounded" />
    {/if}
  </li>
{/if}
