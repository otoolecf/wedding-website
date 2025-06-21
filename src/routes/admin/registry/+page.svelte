<!-- src/routes/admin/registry/+page.svelte -->
<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';

  let settings = {
    registries: {
      externalRegistries: [],
      honeymoonFund: {
        enabled: true,
        title: 'Honeymoon Fund',
        description:
          "If you'd prefer to contribute to our honeymoon adventures, we've set up a honeymoon fund.",
        buttonText: 'Contribute to Our Honeymoon',
        venmoUsername: '',
        showVenmo: false
      }
    }
  };

  let error = null;
  let saving = false;
  let newRegistry = {
    name: '',
    url: '',
    image: '',
    description: ''
  };

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      const data = await response.json();
      settings = { ...settings, ...data.settings };
    } catch (err) {
      error = err.message;
      console.error('Error loading settings:', err);
    }
  });

  async function saveSettings() {
    saving = true;
    error = null;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err) {
      error = err.message;
      console.error('Error saving settings:', err);
    } finally {
      saving = false;
    }
  }

  function addRegistry() {
    if (!newRegistry.name || !newRegistry.url) return;
    settings.registries.externalRegistries = [
      ...settings.registries.externalRegistries,
      { ...newRegistry }
    ];
    newRegistry = { name: '', url: '', image: '', description: '' };
  }

  function removeRegistry(index) {
    settings.registries.externalRegistries = settings.registries.externalRegistries.filter(
      (_, i) => i !== index
    );
  }
</script>

<AdminNav />

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-light mb-8">Registry Management</h1>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={saveSettings} class="space-y-6">
    <!-- External Registries -->
    <div class="mb-8">
      <h2 class="text-2xl font-light mb-6">External Registries</h2>
      <div class="space-y-4">
        {#each settings.registries.externalRegistries as registry, i}
          <div class="bg-gray-50 p-4 rounded border">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-medium">{registry.name}</h4>
              <button
                type="button"
                on:click={() => removeRegistry(i)}
                class="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
            <p class="text-sm text-gray-600">{registry.description}</p>
            <a href={registry.url} target="_blank" class="text-sm text-primary hover:underline">
              {registry.url}
            </a>
          </div>
        {/each}
      </div>

      <div class="mt-6 p-4 bg-gray-50 rounded border">
        <h3 class="text-xl font-medium mb-4">Add New Registry</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="registry-name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              id="registry-name"
              type="text"
              bind:value={newRegistry.name}
              class="w-full p-2 border rounded"
              placeholder="Registry Name"
            />
          </div>
          <div>
            <label for="registry-url" class="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              id="registry-url"
              type="url"
              bind:value={newRegistry.url}
              class="w-full p-2 border rounded"
              placeholder="https://example.com/registry"
            />
          </div>
          <div>
            <label for="registry-image" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              id="registry-image"
              type="url"
              bind:value={newRegistry.image}
              class="w-full p-2 border rounded"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label for="registry-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              id="registry-description"
              type="text"
              bind:value={newRegistry.description}
              class="w-full p-2 border rounded"
              placeholder="Brief description"
            />
          </div>
        </div>
        <button
          type="button"
          on:click={addRegistry}
          class="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Add Registry
        </button>
      </div>
    </div>

    <!-- Honeymoon Fund -->
    <div>
      <h2 class="text-2xl font-light mb-6">Honeymoon Fund</h2>
      <div class="space-y-4">
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            bind:checked={settings.registries.honeymoonFund.enabled}
            class="form-checkbox h-4 w-4 text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Enable Honeymoon Fund Section</span>
        </div>

        <div>
          <label for="honeymoon-title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            id="honeymoon-title"
            type="text"
            bind:value={settings.registries.honeymoonFund.title}
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label for="honeymoon-description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="honeymoon-description"
            bind:value={settings.registries.honeymoonFund.description}
            class="w-full p-2 border rounded"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label for="honeymoon-button-text" class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input
            id="honeymoon-button-text"
            type="text"
            bind:value={settings.registries.honeymoonFund.buttonText}
            class="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label for="honeymoon-venmo" class="block text-sm font-medium text-gray-700 mb-1">Venmo Username</label>
          <input
            id="honeymoon-venmo"
            type="text"
            bind:value={settings.registries.honeymoonFund.venmoUsername}
            class="w-full p-2 border rounded"
            placeholder="@username"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            bind:checked={settings.registries.honeymoonFund.showVenmo}
            class="form-checkbox h-4 w-4 text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Show Venmo Information</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
        disabled={saving}
      >
        {#if saving}
          Saving...
        {:else}
          Save Settings
        {/if}
      </button>
    </div>
  </form>
</div>
