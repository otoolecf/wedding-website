<!-- src/routes/admin/deploy/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import AdminNav from '$lib/components/AdminNav.svelte';

  let isDeploying = false;
  let deploymentStatus = null;
  let error = null;
  let isPreview = false;

  onMount(() => {
    // Check if we're in preview environment
    isPreview = $page.data.isPreview;
  });

  async function deployContent() {
    isDeploying = true;
    error = null;
    deploymentStatus = null;

    try {
      const response = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      deploymentStatus = data;
    } catch (e) {
      error = e.message;
    } finally {
      isDeploying = false;
    }
  }
</script>

<AdminNav />

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6">Content Deployment</h1>

  <div class="bg-white rounded-lg shadow-md p-6">
    {#if isPreview}
      <p class="mb-4">
        This will copy all content (images, themes, pages, etc.) from the preview environment to
        production. RSVP and guest list data will not be affected.
      </p>

      <button
        on:click={deployContent}
        disabled={isDeploying}
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isDeploying ? 'Deploying...' : 'Deploy to Production'}
      </button>

      {#if error}
        <div class="mt-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      {/if}

      {#if deploymentStatus}
        <div class="mt-4 p-4 bg-green-100 text-green-700 rounded">
          <p>Deployment successful!</p>
          <p>KV keys copied: {deploymentStatus.kvKeysCopied}</p>
          <p>R2 objects copied: {deploymentStatus.r2ObjectsCopied}</p>
        </div>
      {/if}
    {:else}
      <div class="p-4 bg-yellow-100 text-yellow-700 rounded">
        <p>This deployment tool is only available in the preview environment.</p>
        <p class="mt-2">To deploy content to production, please use the preview environment.</p>
      </div>
    {/if}
  </div>
</div>
