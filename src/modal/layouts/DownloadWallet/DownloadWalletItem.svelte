<script lang="ts">
  import Button from "../../components/buttons/Button.svelte";

  export let title: string
  export let subtitle: string
  export let link: string | undefined = undefined
  export let handleClick: (() => void) | undefined = undefined
</script>

<div class="flex flex-row gap-3 px-4 py-3 rounded-xl bg-surface-elevated">
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1 text-left">
      <h4 class="text-heading5 text-primary capitalize">{title}</h4>
      <p class="text-l1 text-secondary-web">{subtitle}</p>
    </div>
    <div class="flex gap-3 text-primary">
      <slot name="icons" />
    </div>
    <Button
      as={handleClick ? "button" : "a"}
      href={link}
      handleClick={handleClick}
      handleKeyup={(e) => {
        if (handleClick && e.key === "Enter") {
          handleClick()
        }
      }}
      className="bg-button-secondary text-primary hover:bg-button-secondary-hover flex w-full h-[32px] text-b3 rounded-3xl justify-center items-center"
    >
      <slot name="button" />
    </Button>
  </div>
  <div class="flex items-center">
    <slot name="graphic" />
  </div>
</div>