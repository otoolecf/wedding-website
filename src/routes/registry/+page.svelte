<!-- src/routes/registry/+page.svelte -->
<script>
  import { page } from '$app/stores';

  export const load = async ({ fetch }) => {
    const response = await fetch('/api/admin/settings');
    const { settings } = await response.json();
    return { settings };
  };
</script>

<svelte:head>
  <title>Registry | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-6">Registry</h1>

  <p class="text-center max-w-2xl mx-auto mb-12">
    Your presence at our wedding is the greatest gift of all. However, for those who have asked,
    we've created registries at the following stores:
  </p>

  <div class="grid md:grid-cols-3 gap-8">
    {#each $page.data.settings.registries.externalRegistries as registry}
      <a href={registry.url} target="_blank" rel="noopener noreferrer" class="block group">
        <div
          class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        >
          <img
            src={registry.image}
            alt={registry.name}
            class="w-full h-48 object-cover rounded mb-4"
          />
          <h2 class="text-xl font-medium mb-2 text-primary group-hover:opacity-80">
            {registry.name}
          </h2>
          <p class="text-secondary text-sm">{registry.description}</p>
        </div>
      </a>
    {/each}
  </div>

  {#if $page.data.settings.registries.honeymoonFund.enabled}
    <div class="mt-12 text-center">
      <h2 class="text-2xl font-light mb-4">{$page.data.settings.registries.honeymoonFund.title}</h2>
      <p class="max-w-2xl mx-auto">
        {$page.data.settings.registries.honeymoonFund.description}
      </p>
      {#if $page.data.settings.registries.honeymoonFund.showVenmo}
        <div class="mt-4">
          <p class="text-lg font-medium">
            Venmo: @{$page.data.settings.registries.honeymoonFund.venmoUsername}
          </p>
        </div>
      {/if}
      <a
        href="#"
        class="inline-block mt-6 btn-primary px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
      >
        {$page.data.settings.registries.honeymoonFund.buttonText}
      </a>
    </div>
  {/if}
</div>
