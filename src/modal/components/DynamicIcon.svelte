<script lang="ts">
  import type { Theme } from "../../types/modal"
  import type { ConnectorIcons } from "../../connectors"

  export let theme: Theme
  export let icon: ConnectorIcons

  const renderIcon =
    typeof icon === "string"
      ? icon
      : theme === "dark"
        ? icon.dark
        : icon.light
</script>

{#if renderIcon.trimStart()?.startsWith("<svg")}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="flex flex-shrink items-center max-w-[32px]" style="position: relative;">{@html renderIcon}</div>
{:else}
  <img src={renderIcon} class="w-8 h-8 rounded" alt=""  />
{/if}
