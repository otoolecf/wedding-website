<!-- src/lib/components/page-builder/SaveFeedback.svelte -->
<script>
  import { pageBuilderStore } from '$lib/page-builder/store';
  import { onMount, onDestroy } from 'svelte';

  // Props
  export let showDebug = false;

  // State
  let saveState = {
    saving: false,
    lastSaved: null,
    error: null,
    dirty: false
  };

  // Timer for autosave if needed
  let autosaveTimer = null;
  let unsubscribe;

  onMount(() => {
    // Subscribe to the store to track save state
    unsubscribe = pageBuilderStore.subscribe((state) => {
      saveState = {
        saving: state.isSaving,
        lastSaved: state.lastSaved,
        error: state.error,
        dirty: state.isDirty
      };
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
    if (autosaveTimer) clearInterval(autosaveTimer);
  });

  // Format the last saved time
  function formatLastSaved(timestamp) {
    if (!timestamp) return 'Never';

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);

      if (diffSec < 60) {
        return 'Just now';
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffSec < 86400) {
        const hours = Math.floor(diffSec / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        return date.toLocaleString();
      }
    } catch (e) {
      console.error('Error formatting timestamp:', e);
      return 'Unknown';
    }
  }

  // Get icon and message based on state
  $: icon = saveState.saving
    ? 'spinner'
    : saveState.error
      ? 'alert-triangle'
      : saveState.dirty
        ? 'edit'
        : 'check';

  $: message = saveState.saving
    ? 'Saving...'
    : saveState.error
      ? `Error: ${saveState.error}`
      : saveState.dirty
        ? 'Unsaved changes'
        : 'All changes saved';

  $: iconClass = saveState.saving
    ? 'animate-spin text-blue-500'
    : saveState.error
      ? 'text-red-500'
      : saveState.dirty
        ? 'text-amber-500'
        : 'text-green-500';
</script>

<div
  class="save-feedback flex items-center gap-2 font-medium text-sm"
  class:error={saveState.error}
>
  {#if icon === 'spinner'}
    <svg
      class="w-4 h-4 {iconClass}"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  {:else if icon === 'alert-triangle'}
    <svg
      class="w-4 h-4 {iconClass}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      ></path>
    </svg>
  {:else if icon === 'edit'}
    <svg
      class="w-4 h-4 {iconClass}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      ></path>
    </svg>
  {:else}
    <svg
      class="w-4 h-4 {iconClass}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"
      ></path>
    </svg>
  {/if}

  <span>{message}</span>

  {#if saveState.lastSaved && !saveState.error}
    <span class="text-gray-500 text-xs ml-1">
      Last saved: {formatLastSaved(saveState.lastSaved)}
    </span>
  {/if}

  {#if showDebug}
    <button
      class="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
      on:click={() => pageBuilderStore.diagnose()}
    >
      Debug
    </button>
  {/if}
</div>
