<script lang="ts">
  export let href: string = ""
  export let ariaLabel: string
  export let className: string
  export let as: "a" | "button" = "button"

  export let handleClick: (e: MouseEvent) => void = (e: MouseEvent) => console.log("click", e)
  export let handleKeyup: (e: KeyboardEvent) => void = (e: KeyboardEvent) => console.log("keyup", e)
</script>

<svelte:element
  this={as}
  href={href}
  on:click={handleClick}
  on:keyup={handleKeyup}
  class={`
    p-2 cursor-pointer text-primary rounded-full bg-surface-elevated-web
		focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700
		transition-colors ${className}
  `}
  rel="noreferrer noopener"
  target="_blank"
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
>
  <slot/>
</svelte:element>