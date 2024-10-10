<script lang="ts">
  export let ariaLabel: string
  export let className: string
</script>

<span
  class={`p-2 cursor-pointer
			  rounded-full bg-neutral-100 dark:bg-neutral-800
			  text-neutral-400 dark:text-white
			  hover:bg-neutral-100 dark:hover:bg-neutral-700
			  focus:outline-none focus:ring-2
			focus:ring-neutral-200 dark:focus:ring-neutral-700
			  transition-colors ${className}`}
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
>
  <slot/>
</span>