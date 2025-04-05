<!-- src/routes/admin/guest-list/+page.svelte -->
<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';

  let guests = [];
  let error = null;
  let uploading = false;
  let fileInput;
  let file = null;
  let addingGuest = false;
  let newGuest = {
    name: '',
    partner_name: '',
    plus_one_allowed: false
  };

  onMount(async () => {
    await loadGuests();
  });

  async function loadGuests() {
    try {
      const response = await fetch('/api/admin/guest-list');
      if (!response.ok) throw new Error('Failed to load guest list');
      const data = await response.json();
      guests = data.guests;
    } catch (err) {
      error = err.message;
      console.error('Error loading guest list:', err);
    }
  }

  function handleFileSelect(event) {
    file = event.target.files[0];
  }

  async function uploadGuestList() {
    if (!file) {
      error = 'Please select a CSV file';
      return;
    }

    uploading = true;
    error = null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/guest-list/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to upload guest list');
      }

      await loadGuests();
      file = null;
      fileInput.value = '';
    } catch (err) {
      error = err.message;
      console.error('Error uploading guest list:', err);
    } finally {
      uploading = false;
    }
  }

  async function addGuest() {
    if (!newGuest.name) {
      error = 'Name is required';
      return;
    }

    try {
      const response = await fetch('/api/admin/guest-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGuest)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add guest');
      }

      await loadGuests();
      newGuest = {
        name: '',
        partner_name: '',
        plus_one_allowed: false
      };
      addingGuest = false;
    } catch (err) {
      error = err.message;
      console.error('Error adding guest:', err);
    }
  }

  async function deleteGuest(id) {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    try {
      const response = await fetch(`/api/admin/guest-list/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete guest');
      await loadGuests();
    } catch (err) {
      error = err.message;
      console.error('Error deleting guest:', err);
    }
  }
</script>

<AdminNav />

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Guest List Management</h1>
    <div class="flex items-center space-x-4">
      <button
        on:click={() => (addingGuest = !addingGuest)}
        class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        {addingGuest ? 'Cancel' : 'Add Guest'}
      </button>
      <input
        type="file"
        bind:this={fileInput}
        accept=".csv"
        on:change={handleFileSelect}
        class="hidden"
      />
      <button
        on:click={() => fileInput.click()}
        class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Select CSV
      </button>
      <button
        on:click={uploadGuestList}
        disabled={!file || uploading}
        class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Guest List'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  {#if file}
    <div class="bg-gray-50 p-4 rounded mb-6">
      <p class="text-gray-700">Selected file: {file.name}</p>
    </div>
  {/if}

  {#if addingGuest}
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-light mb-4">Add New Guest</h2>
      <form on:submit|preventDefault={addGuest} class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              id="name"
              bind:value={newGuest.name}
              required
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style="focus-ring-color: var(--color-primary)"
            />
          </div>
          <div class="md:col-span-2">
            <label for="partner_name" class="block text-sm font-medium text-gray-700 mb-1"
              >Partner/Spouse Name (if applicable)</label
            >
            <input
              type="text"
              id="partner_name"
              bind:value={newGuest.partner_name}
              class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style="focus-ring-color: var(--color-primary)"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="plus_one_allowed"
            bind:checked={newGuest.plus_one_allowed}
            class="h-4 w-4 text-primary"
          />
          <label for="plus_one_allowed" class="text-sm font-medium text-gray-700"
            >Allow additional guests (for family members, etc.)</label
          >
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Note: Check this box if this guest should be allowed to bring additional family members
          (e.g., children). Most guests will not have this option. If they have a partner/spouse,
          add them in the fields above instead.
        </p>
        <div class="flex justify-end">
          <button
            type="submit"
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Add Guest
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >Partner Email</th
            >
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >Plus One Allowed</th
            >
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each guests as guest}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{guest.name}</td>
              <td class="px-6 py-4 whitespace-nowrap">{guest.email || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap">{guest.partner_name || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap">{guest.partner_email || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class={`px-2 py-1 rounded-full text-xs ${
                    guest.plus_one_allowed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {guest.plus_one_allowed ? 'Yes' : 'No'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  on:click={() => deleteGuest(guest.id)}
                  class="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <div class="mt-8 bg-gray-50 p-6 rounded-lg">
    <h2 class="text-xl font-medium mb-4">CSV Format</h2>
    <p class="text-gray-600 mb-4">Upload a CSV file with the following columns:</p>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border">
        <thead>
          <tr>
            <th class="px-4 py-2 border">name</th>
            <th class="px-4 py-2 border">email</th>
            <th class="px-4 py-2 border">partner_name</th>
            <th class="px-4 py-2 border">partner_email</th>
            <th class="px-4 py-2 border">plus_one_allowed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 border">John Smith</td>
            <td class="px-4 py-2 border">john@example.com</td>
            <td class="px-4 py-2 border">Jane Smith</td>
            <td class="px-4 py-2 border">jane@example.com</td>
            <td class="px-4 py-2 border">true</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-gray-600 mt-4">
      Note: All columns except 'name' are optional. 'plus_one_allowed' should be 'true' or 'false'.
    </p>
  </div>
</div>
