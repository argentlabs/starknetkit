<script lang="ts">
  import Button from "../../../components/buttons/Button.svelte";

  export let title: string
  export let subtitle: string
  export let link: string
</script>

<div class="flex flex-row gap-3 px-4 py-3 rounded-xl bg-surface-elevated">
  <div class="flex flex-col gap-3 flex-grow">
    <div class="flex flex-col gap-1 text-left">
      <h4 class="text-heading5 text-primary">{title}</h4>
      <p class="text-l1 text-secondary-web">{subtitle}</p>
    </div>
    <div class="flex gap-3">
      <slot name="icons" />
    </div>
    <Button as="a" href={link} className="bg-button-secondary text-primary hover:bg-button-secondary-hover flex w-[140px] h-[32px] text-b3 rounded-3xl justify-center items-center" >
      Download
    </Button>
  </div>
  <div class="flex items-center">
    <slot name="graphic" />
  </div>
</div>