<script lang="ts">
  import LargeButton from "../../components/buttons/LargeButton.svelte";

  export let browser: string
  export let href: string
  export let extensionName: string = ""
</script>

<li>
    <LargeButton as="a" href={href}>
        <div class="w-full flex flex-row-reverse justify-end items-center gap-2">
            <p class="text-surface-inverted flex flex-col text-left">
                <span class="text-l2">Download {extensionName} for</span>
                <span class="text-p3">{browser}</span>
            </p>
            <slot />
        </div>
    </LargeButton>
</li>
