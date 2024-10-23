<script lang="ts">
  import Link from "./Link.svelte";

  export let className: string | undefined = ""
  export let href: string | undefined = undefined
  export let as: "button" | "a" = "button"
  export let isLarge: boolean = false

  export let height = isLarge ? "min-h-12" : "min-h-8"
</script>

<Link
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