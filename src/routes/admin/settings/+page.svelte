<!-- src/routes/admin/settings/+page.svelte -->
<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';

  let settings = {
    weddingDate: '',
    weddingTime: '',
    venueName: '',
    venueAddress: '',
    groomName: '',
    brideName: '',
    showCountdown: true,
    nameOrder: 'groom-first',
    rsvpButtonText: 'RSVP Now',
    rsvpButtonLink: '/rsvp',
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

  const init = {
    height: 500,
    menubar: false,
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'code',
      'help',
      'wordcount'
    ],
    toolbar:
      'undo redo | blocks | ' +
      'bold italic forecolor | alignleft aligncenter ' +
      'alignright alignjustify | bullist numlist outdent indent | ' +
      'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    convert_urls: false,
    relative_urls: false
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

  function swapNameOrder() {
    settings.nameOrder = settings.nameOrder === 'groom-first' ? 'bride-first' : 'groom-first';
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

  // Compute preview of names based on current order
  $: namePreview =
    settings.nameOrder === 'groom-first'
      ? `${settings.groomName} & ${settings.brideName}`
      : `${settings.brideName} & ${settings.groomName}`;
</script>

<AdminNav />

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-light mb-8">Wedding Settings</h1>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={saveSettings} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="groomName" class="block text-sm font-medium text-gray-700 mb-1">
          Groom's Name
        </label>
        <input
          type="text"
          id="groomName"
          bind:value={settings.groomName}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label for="brideName" class="block text-sm font-medium text-gray-700 mb-1">
          Bride's Name
        </label>
        <input
          type="text"
          id="brideName"
          bind:value={settings.brideName}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div class="md:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">Name Order</label>
          <button
            type="button"
            on:click={swapNameOrder}
            class="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Swap Order
          </button>
        </div>
        <div class="p-4 bg-gray-50 rounded border">
          <p class="text-center text-lg font-medium">{namePreview}</p>
        </div>
      </div>

      <div>
        <label for="weddingDate" class="block text-sm font-medium text-gray-700 mb-1">
          Wedding Date
        </label>
        <input
          type="date"
          id="weddingDate"
          bind:value={settings.weddingDate}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label for="weddingTime" class="block text-sm font-medium text-gray-700 mb-1">
          Wedding Time
        </label>
        <input
          type="time"
          id="weddingTime"
          bind:value={settings.weddingTime}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div class="md:col-span-2">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            bind:checked={settings.showCountdown}
            class="form-checkbox h-4 w-4 text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Show Countdown on Home Page</span>
        </label>
      </div>

      <div class="md:col-span-2">
        <label class="flex items-center space-x-2">
          <input
            type="checkbox"
            bind:checked={settings.showOnlyHomeInProduction}
            class="form-checkbox h-4 w-4 text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Show Only Home Page in Production</span>
        </label>
      </div>

      <div class="md:col-span-2">
        <label for="venueName" class="block text-sm font-medium text-gray-700 mb-1">
          Venue Name
        </label>
        <input
          type="text"
          id="venueName"
          bind:value={settings.venueName}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div class="md:col-span-2">
        <label for="venueAddress" class="block text-sm font-medium text-gray-700 mb-1">
          Venue Address
        </label>
        <textarea
          id="venueAddress"
          bind:value={settings.venueAddress}
          class="w-full p-2 border rounded"
          rows="3"
          required
        ></textarea>
      </div>

      <div>
        <label for="rsvpButtonText" class="block text-sm font-medium text-gray-700 mb-1">
          RSVP Button Text
        </label>
        <input
          type="text"
          id="rsvpButtonText"
          bind:value={settings.rsvpButtonText}
          class="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label for="rsvpButtonLink" class="block text-sm font-medium text-gray-700 mb-1">
          RSVP Button Link
        </label>
        <input
          type="text"
          id="rsvpButtonLink"
          bind:value={settings.rsvpButtonLink}
          class="w-full p-2 border rounded"
          required
        />
      </div>
    </div>

    <!-- Registry Settings -->
    <div class="border-t pt-8 mt-8">
      <h2 class="text-2xl font-light mb-6">Registry Settings</h2>

      <!-- External Registries -->
      <div class="mb-8">
        <h3 class="text-xl font-medium mb-4">External Registries</h3>
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
          <h4 class="font-medium mb-4">Add New Registry</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                bind:value={newRegistry.name}
                class="w-full p-2 border rounded"
                placeholder="Registry Name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                bind:value={newRegistry.url}
                class="w-full p-2 border rounded"
                placeholder="https://example.com/registry"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                bind:value={newRegistry.image}
                class="w-full p-2 border rounded"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
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
        <h3 class="text-xl font-medium mb-4">Honeymoon Fund</h3>
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              bind:value={settings.registries.honeymoonFund.title}
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              bind:value={settings.registries.honeymoonFund.description}
              class="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
            <input
              type="text"
              bind:value={settings.registries.honeymoonFund.buttonText}
              class="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Venmo Username</label>
            <input
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
