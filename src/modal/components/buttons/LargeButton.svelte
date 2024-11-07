<script lang="ts">
	export let href: string = ""
	export let ariaLabel: string = ""
	export let className: string = ""
	export let as: "a" | "button" = "button"

	export let handleClick: (e: MouseEvent) => void = (e: MouseEvent) => console.log("click", e)
	export let handleKeyup: (e: KeyboardEvent) => void = (e: KeyboardEvent) => console.log("keyup", e)
</script>

<svelte:element
	this={as}
	href={href}
	on:click={handleClick}
	on:keyup={handleKeyup}
	rel="noreferrer noopener"
	target="_blank"
	role="button"
	aria-label={ariaLabel}
	tabindex="0"
	class={`
		flex justify-center items-center w-full px-3 h-[60px] rounded-[12px] cursor-pointer shadow-list-item
		dark:shadow-none bg-surface-elevated focus:outline-none focus:ring-2 text-primary
		focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors ${className}
	`}
>
	<slot />
</svelte:element>
