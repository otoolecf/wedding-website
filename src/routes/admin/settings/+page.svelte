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
    restrictToHomePage: true,
    nameOrder: 'groom-first',
    rsvpButtonText: 'RSVP Now',
    rsvpButtonLink: '/rsvp',
    defaultPages: [
      { id: 'home', name: 'Home', slug: '', order: 0 },
      { id: 'gallery', name: 'Gallery', slug: 'gallery', order: 1 },
      { id: 'rsvp', name: 'RSVP', slug: 'rsvp', order: 2 },
      { id: 'registry', name: 'Registry', slug: 'registry', order: 3 }
    ]
  };

  let error = null;
  let saving = false;
  let saveSuccess = false;
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
    saveSuccess = false;
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

      saveSuccess = true;
      // Hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess = false;
      }, 3000);
    } catch (e) {
      error = e.message;
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
            bind:checked={settings.restrictToHomePage}
            class="form-checkbox h-4 w-4 text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Restrict site to home page only</span>
        </label>
      </div>

      <div class="md:col-span-2">
        <label for="nameOrder" class="block text-sm font-medium text-gray-700 mb-1">
          Name Order
        </label>
        <select
          id="nameOrder"
          bind:value={settings.nameOrder}
          class="w-full p-2 border rounded"
          required
        >
          <option value="groom-first">Groom's Name First</option>
          <option value="bride-first">Bride's Name First</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <h3 class="text-lg font-medium mb-4">Default Pages</h3>
        <div class="space-y-4">
          {#each settings.defaultPages as page}
            <div class="flex items-center gap-4">
              <input
                type="text"
                bind:value={page.name}
                class="w-full max-w-[200px] p-2 border rounded"
                placeholder="Page Name"
              />
              <input
                type="text"
                bind:value={page.slug}
                class="w-full max-w-[200px] p-2 border rounded"
                placeholder="URL Slug"
              />
              <input
                type="number"
                bind:value={page.order}
                class="w-20 p-2 border rounded"
                placeholder="Order"
              />
            </div>
          {/each}
        </div>
      </div>

      <div class="md:col-span-2">
        <label for="venueName" class="block text-sm font-medium text-gray-700 mb-1">
          Venue Name
        </label>
        <input
          type="text"
          id="venueName"
          bind:value={settings.venueName}
          class="w-full p-3 border rounded text-lg font-medium"
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
          class="w-full p-2 border rounded whitespace-pre-wrap"
          rows="3"
          required
        ></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-4">
      {#if error}
        <div class="text-red-600">{error}</div>
      {/if}
      {#if saveSuccess}
        <div class="text-green-600">Settings saved successfully!</div>
      {/if}
      <button
        type="submit"
        class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 disabled:opacity-50"
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
