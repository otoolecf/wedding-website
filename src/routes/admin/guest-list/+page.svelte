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
    email: '',
    partner_name: ''
  };
  let showDeleteConfirm = false;
  let guestToDelete = null;

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
        email: '',
        partner_name: ''
      };
      addingGuest = false;
    } catch (err) {
      error = err.message;
      console.error('Error adding guest:', err);
    }
  }

  function confirmDelete(guest) {
    guestToDelete = guest;
    showDeleteConfirm = true;
  }

  async function deleteGuest() {
    if (!guestToDelete) return;

    try {
      const response = await fetch(`/api/admin/guest-list/${guestToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete guest');
      await loadGuests();
    } catch (err) {
      error = err.message;
      console.error('Error deleting guest:', err);
    } finally {
      showDeleteConfirm = false;
      guestToDelete = null;
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
    </div>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
      {#if error.includes('Failed to process CSV file')}
        <p class="mt-2 text-sm">Please check your CSV format and try again.</p>
      {/if}
    </div>
  {/if}

  {#if file}
    <div class="bg-gray-50 p-4 rounded mb-6 flex items-center justify-between">
      <p class="text-gray-700">Selected file: {file.name}</p>
      <button
        on:click={uploadGuestList}
        disabled={uploading}
        class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Guest List'}
      </button>
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
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email (for save the dates and updates)</label>
            <input
              type="email"
              id="email"
              bind:value={newGuest.email}
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each guests as guest}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{guest.name}</td>
              <td class="px-6 py-4 whitespace-nowrap">{guest.email || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap">{guest.partner_name || '-'}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  on:click={() => confirmDelete(guest)}
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 border">John Smith</td>
            <td class="px-4 py-2 border">john@example.com</td>
            <td class="px-4 py-2 border">Jane Smith</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-gray-600 mt-4">
      Note: Only the 'name' column is required. 'email' and 'partner_name' are optional. The email field will be used for save the dates and other wedding updates.
    </p>
  </div>
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 class="text-lg font-medium mb-4">Confirm Delete</h3>
      <p class="mb-4">
        Are you sure you want to delete {guestToDelete.name}? This will also delete any associated
        RSVPs. This action cannot be undone.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          on:click={() => {
            showDeleteConfirm = false;
            guestToDelete = null;
          }}
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          on:click={deleteGuest}
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}
