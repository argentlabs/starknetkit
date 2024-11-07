<script lang="ts">
  import IconButton from "./buttons/IconButton.svelte";
  import CloseIcon from "./icons/CloseIcon.svelte";
  import CaretIcon from "./icons/CaretIcon.svelte";

  export let title: string;
  export let subtitle: string = "Connect to";
  export let showBackButton: boolean = true;
  export let showCloseButton: boolean = true;

  export let handleBack: () => void = () => {}
  export let handleClose: () => void = () => {}
</script>

<header class={`flex items-center justify-center flex-col relative`}>
  {#if showBackButton}
    <IconButton
      handleClick={handleBack}
      handleKeyup={(e) => {
        if (e.key === "Enter") {
          handleBack()
        }
      }}
      ariaLabel="Go back"
      className="absolute top-0 left-0">
        <CaretIcon />
    </IconButton>
  {/if}
  <hgroup>
    <h2 class={`text-p3 text-secondary font-semibold`}>{subtitle}</h2>
    {#if !!title}
      <h1 class={`text-[24px] text-primary font-semibold max-w-[240px] overflow-hidden whitespace-nowrap text-ellipsis`}>
        {title}
      </h1>
    {/if}
  </hgroup>
  {#if showCloseButton}
    <IconButton
      handleClick={handleClose}
      handleKeyup={(e) => {
        if (e.key === "Enter") {
          handleClose()
        }
      }}
      ariaLabel="Close"
      className="absolute top-0 right-0"
    >
      <CloseIcon />
    </IconButton>
  {/if}
</header>
