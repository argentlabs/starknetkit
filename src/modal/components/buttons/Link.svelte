<script lang="ts">
  export let className: string
  export let href: string | undefined = undefined
  export let as: "button" | "a" = "a"

  export let handleClick: ((e: MouseEvent) => void) | undefined = undefined
  export let handleKeyup: ((e: KeyboardEvent) => void) | undefined = undefined
</script>

<svelte:element
  this={as}
  class={className}
  href={href}
  rel="noreferrer noopener"
  target="_blank"
  on:click={handleClick}
  on:keyup={handleKeyup}
  role="button"
  tabindex="0"
>
  <slot />
</svelte:element>