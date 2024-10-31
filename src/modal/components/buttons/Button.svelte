<script lang="ts">
  import Link from "./Link.svelte";

  export let className: string | undefined = ""
  export let href: string | undefined = undefined
  export let as: "button" | "a" = "button"
  export let isLarge: boolean = false

  const height = isLarge ? "min-h-12" : "min-h-8"

  export let handleClick: (e: MouseEvent) => void = (e: MouseEvent) => console.log("click", e)
  export let handleKeyup: (e: KeyboardEvent) => void = (e: KeyboardEvent) => console.log("keyup", e)
</script>

<Link
  handleClick={handleClick}
  handleKeyup={handleKeyup}
  as={as}
  href={href}
  className={`
        ${className} ${height} px-4
        bg-button-secondary text-primary hover:bg-button-secondary-hover flex
        min-w-[140px] text-b3 rounded-3xl justify-center items-center
    `}
>
  <slot />
</Link>