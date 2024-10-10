<script lang="ts">
	export let href: string = ""
	export let as: "a" | "button" = "button"
</script>

<svelte:element
	this={as}
	href={href}
	rel="noreferrer noopener"
	target="_blank"
	role="button"
	tabindex="0"
	class={`
		flex justify-center items-center w-full px-3 h-[60px] rounded-[12px] cursor-pointer shadow-list-item
		dark:shadow-none bg-surface-elevated focus:outline-none focus:ring-2
		focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors
	`}
>
	<slot />
</svelte:element>
