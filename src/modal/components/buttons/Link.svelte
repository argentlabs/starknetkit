<script lang="ts">
  export let className: string
  export let href: string | undefined = undefined
  export let as: "button" | "a" = "a"
</script>

<svelte:element this={as} class={className} href={href} rel="noreferrer noopener" target="_blank">
  <slot />
</svelte:element>