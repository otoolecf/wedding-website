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
    rsvpButtonText: 'RSVP Now',
    rsvpButtonLink: '/rsvp'
  };

  let error = null;
  let saving = false;

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
