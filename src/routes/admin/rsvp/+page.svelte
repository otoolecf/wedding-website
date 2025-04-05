<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';
  import { formSettings, loadFormSettings, saveFormSettings } from '$lib/stores/formSettings';
  import { onDestroy } from 'svelte';

  let rsvps = [];
  let error = null;
  let stats = {
    totalResponses: 0,
    totalAttending: 0,
    totalNotAttending: 0,
    totalGuests: 0,
    pendingResponses: 0
  };
  let showDeleteConfirm = false;
  let rsvpToDelete = null;
  let editingRsvp = null;
  let editedRsvp = null;
  let guestList = [];
  let settings = {};
  let activeTab = 'overview';

  // Subscribe to form settings
  const unsubscribe = formSettings.subscribe((value) => {
    settings = value;
  });

  // Clean up subscription
  onDestroy(() => {
    unsubscribe();
  });

  // Fetch data on component mount
  onMount(async () => {
    try {
      // Load form settings
      await loadFormSettings();

      // Fetch RSVPs
      const rsvpResponse = await fetch('/api/admin/rsvps');
      if (!rsvpResponse.ok) {
        throw new Error(`Failed to fetch RSVPs: ${rsvpResponse.statusText}`);
      }
      const rsvpData = await rsvpResponse.json();
      rsvps = rsvpData.rsvps;

      // Fetch guest list to calculate pending responses
      const guestResponse = await fetch('/api/admin/guest-list');
      if (!guestResponse.ok) {
        throw new Error(`Failed to fetch guest list: ${guestResponse.statusText}`);
      }
      const guestData = await guestResponse.json();
      guestList = guestData.guests;

      // Calculate stats
      stats.totalResponses = rsvps.length;
      stats.totalAttending = rsvps.filter((r) => r.attending === 'yes').length;
      stats.totalNotAttending = rsvps.filter((r) => r.attending === 'no').length;

      // Calculate total guests (including partners)
      stats.totalGuests = rsvps.filter((r) => r.attending === 'yes').length;

      // Calculate pending responses
      const respondedNames = new Set(rsvps.map((r) => r.name));
      stats.pendingResponses = guestList.reduce((count, guest) => {
        if (!respondedNames.has(guest.name)) count++;
        if (guest.partner_name && !respondedNames.has(guest.partner_name)) count++;
        return count;
      }, 0);
    } catch (err) {
      error = 'Failed to load RSVPs';
      console.error(err);
    }
  });

  function getPartnerName(rsvp) {
    const guest = guestList.find((g) => g.id === rsvp.guest_id);
    return guest?.partner_name || '-';
  }

  function downloadCsv() {
    const headers = [
      'Name',
      'Email',
      'Partner',
      'Attending',
      'Vegetarian',
      'Food Allergies',
      'Staying at Melrose',
      'Using Transport',
      'Song Request',
      'Special Notes',
      'Submitted At'
    ];
    const csvContent = [
      headers.join(','),
      ...rsvps.map((rsvp) =>
        [
          rsvp.name,
          rsvp.email,
          getPartnerName(rsvp),
          rsvp.attending,
          rsvp.is_vegetarian,
          `"${(rsvp.food_allergies || '').replace(/"/g, '""')}"`,
          rsvp.staying_at_melrose,
          rsvp.using_transport,
          `"${(rsvp.song || '').replace(/"/g, '""')}"`,
          `"${(rsvp.special_notes || '').replace(/"/g, '""')}"`,
          new Date(rsvp.created_at).toLocaleString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `wedding-rsvps-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  }

  function confirmDelete(rsvp) {
    rsvpToDelete = rsvp;
    showDeleteConfirm = true;
  }

  async function deleteRsvp() {
    if (!rsvpToDelete) return;

    try {
      const response = await fetch(`/api/admin/rsvps/${rsvpToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete RSVP');
      await loadRsvps();
    } catch (err) {
      error = err.message;
      console.error('Error deleting RSVP:', err);
    } finally {
      showDeleteConfirm = false;
      rsvpToDelete = null;
    }
  }

  async function loadRsvps() {
    try {
      const rsvpResponse = await fetch('/api/admin/rsvps');
      if (!rsvpResponse.ok) {
        throw new Error(`Failed to fetch RSVPs: ${rsvpResponse.statusText}`);
      }
      const rsvpData = await rsvpResponse.json();
      rsvps = rsvpData.rsvps;

      // Recalculate stats
      stats.totalResponses = rsvps.length;
      stats.totalAttending = rsvps.filter((r) => r.attending === 'yes').length;
      stats.totalNotAttending = rsvps.filter((r) => r.attending === 'no').length;
      stats.totalGuests = rsvps.filter((r) => r.attending === 'yes').length;

      // Fetch guest list to calculate pending responses
      const guestResponse = await fetch('/api/admin/guest-list');
      if (!guestResponse.ok) {
        throw new Error(`Failed to fetch guest list: ${guestResponse.statusText}`);
      }
      const guestData = await guestResponse.json();
      const guestList = guestData.guests;

      const respondedNames = new Set(rsvps.map((r) => r.name));
      stats.pendingResponses = guestList.reduce((count, guest) => {
        if (!respondedNames.has(guest.name)) count++;
        if (guest.partner_name && !respondedNames.has(guest.partner_name)) count++;
        return count;
      }, 0);
    } catch (err) {
      error = 'Failed to load RSVPs';
      console.error(err);
    }
  }

  function startEdit(rsvp) {
    editingRsvp = rsvp;
    editedRsvp = { ...rsvp };
  }

  function cancelEdit() {
    editingRsvp = null;
    editedRsvp = null;
  }

  async function saveEdit() {
    if (!editingRsvp || !editedRsvp) return;

    try {
      const response = await fetch(`/api/admin/rsvps/${editingRsvp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedRsvp)
      });

      if (!response.ok) throw new Error('Failed to update RSVP');
      await loadRsvps();
      editingRsvp = null;
      editedRsvp = null;
    } catch (err) {
      error = err.message;
      console.error('Error updating RSVP:', err);
    }
  }

  function setActiveTab(tab) {
    activeTab = tab;
  }

  async function handleSaveSettings() {
    const success = await saveFormSettings(settings);
    if (success) {
      // Show success message
      alert('Settings saved successfully!');
    } else {
      error = 'Failed to save settings';
    }
  }
</script>

<AdminNav />

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">RSVP Dashboard</h1>
    <div class="flex space-x-4">
      <button
        on:click={downloadCsv}
        class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Download CSV
      </button>
    </div>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else}
    <!-- Tab Navigation -->
    <div class="mb-8 border-b">
      <div class="flex">
        <button
          class="py-2 px-4 border-b-2 {activeTab === 'overview'
            ? 'border-primary font-medium'
            : 'border-transparent'}"
          on:click={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          class="py-2 px-4 border-b-2 {activeTab === 'form'
            ? 'border-primary font-medium'
            : 'border-transparent'}"
          on:click={() => setActiveTab('form')}
        >
          Form Settings
        </button>
      </div>
    </div>

    {#if activeTab === 'overview'}
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-gray-500 text-sm">Total Responses</h3>
          <p class="text-3xl font-light">{stats.totalResponses}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-gray-500 text-sm">Attending</h3>
          <p class="text-3xl font-light text-green-600">{stats.totalAttending}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-gray-500 text-sm">Not Attending</h3>
          <p class="text-3xl font-light text-red-600">{stats.totalNotAttending}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-gray-500 text-sm">Total Guest Count</h3>
          <p class="text-3xl font-light text-primary">{stats.totalGuests}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-gray-500 text-sm">Pending Responses</h3>
          <p class="text-3xl font-light text-yellow-600">{stats.pendingResponses}</p>
        </div>
      </div>

      <!-- RSVP Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Email</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Status</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Vegetarian</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Food Allergies</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Staying at Melrose</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Using Transport</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Song Request</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Special Notes</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Lodging</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Submitted</th
                >
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >Actions</th
                >
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each rsvps as rsvp}
                <tr class="hover:bg-gray-50">
                  {#if editingRsvp?.id === rsvp.id}
                    <!-- Edit Mode -->
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        bind:value={editedRsvp.name}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="email"
                        bind:value={editedRsvp.email}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <select
                        bind:value={editedRsvp.attending}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="yes">Attending</option>
                        <option value="no">Not Attending</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        bind:value={editedRsvp.is_vegetarian}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        bind:value={editedRsvp.food_allergies}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <select
                        bind:value={editedRsvp.staying_at_melrose}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        bind:value={editedRsvp.using_transport}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        bind:value={editedRsvp.song}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <input
                        type="text"
                        bind:value={editedRsvp.special_notes}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <select
                        bind:value={editedRsvp.lodging}
                        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {new Date(rsvp.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap space-x-2">
                      <button on:click={saveEdit} class="text-green-600 hover:text-green-800">
                        Save
                      </button>
                      <button on:click={cancelEdit} class="text-gray-600 hover:text-gray-800">
                        Cancel
                      </button>
                    </td>
                  {:else}
                    <!-- View Mode -->
                    <td class="px-6 py-4">
                      <div class="font-medium">{rsvp.name}</div>
                    </td>
                    <td class="px-6 py-4">{rsvp.email}</td>
                    <td class="px-6 py-4">
                      <span
                        class={`px-2 py-1 rounded-full text-xs ${
                          rsvp.attending === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rsvp.attending === 'yes' ? 'Attending' : 'Not Attending'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`px-2 py-1 rounded-full text-xs ${
                          rsvp.is_vegetarian === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rsvp.is_vegetarian === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="max-w-xs truncate">
                        {rsvp.food_allergies || '-'}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`px-2 py-1 rounded-full text-xs ${
                          rsvp.staying_at_melrose === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rsvp.staying_at_melrose === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`px-2 py-1 rounded-full text-xs ${
                          rsvp.using_transport === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rsvp.using_transport === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="max-w-xs truncate">
                        {rsvp.song || '-'}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="max-w-xs truncate">
                        {rsvp.special_notes || '-'}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class={`px-2 py-1 rounded-full text-xs ${
                          rsvp.lodging === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rsvp.lodging === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      {new Date(rsvp.created_at).toLocaleString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        on:click={() => startEdit(rsvp)}
                        class="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => confirmDelete(rsvp)}
                        class="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {:else if activeTab === 'form'}
      <!-- Form Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-medium mb-6">RSVP Form Settings</h2>

        <div class="space-y-6">
          <!-- Form Title -->
          <div>
            <label for="formTitle" class="block text-sm font-medium text-gray-700 mb-1">
              Form Title
            </label>
            <input
              type="text"
              id="formTitle"
              bind:value={settings.formTitle}
              class="w-full p-2 border rounded"
              placeholder="RSVP Form"
            />
          </div>

          <!-- Form Description -->
          <div>
            <label for="formDescription" class="block text-sm font-medium text-gray-700 mb-1">
              Form Description
            </label>
            <textarea
              id="formDescription"
              bind:value={settings.formDescription}
              class="w-full p-2 border rounded"
              rows="3"
              placeholder="Please RSVP by..."
            ></textarea>
          </div>

          <!-- Show Partner Field -->
          <div>
            <label class="flex items-center">
              <input type="checkbox" bind:checked={settings.showPartnerField} class="mr-2" />
              <span class="text-sm font-medium text-gray-700">Show Partner Field</span>
            </label>
          </div>

          <!-- Show Dietary Requirements -->
          <div>
            <label class="flex items-center">
              <input type="checkbox" bind:checked={settings.showDietaryRequirements} class="mr-2" />
              <span class="text-sm font-medium text-gray-700">Show Dietary Requirements</span>
            </label>
          </div>

          <!-- Show Song Request -->
          <div>
            <label class="flex items-center">
              <input type="checkbox" bind:checked={settings.showSongRequest} class="mr-2" />
              <span class="text-sm font-medium text-gray-700">Show Song Request</span>
            </label>
          </div>

          <!-- Show Special Notes -->
          <div>
            <label class="flex items-center">
              <input type="checkbox" bind:checked={settings.showSpecialNotes} class="mr-2" />
              <span class="text-sm font-medium text-gray-700">Show Special Notes</span>
            </label>
          </div>

          <!-- Save Button -->
          <div class="pt-4">
            <button
              on:click={handleSaveSettings}
              class="bg-primary text-white px-4 py-2 rounded hover:opacity-90 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4">Confirm Delete</h2>
      <p class="mb-6">
        Are you sure you want to delete the RSVP for {rsvpToDelete?.name}? This action cannot be
        undone.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50"
          on:click={() => {
            showDeleteConfirm = false;
            rsvpToDelete = null;
          }}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          on:click={deleteRsvp}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Modal -->
{#if editingRsvp}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4">Edit RSVP</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input type="text" bind:value={editedRsvp.name} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" bind:value={editedRsvp.email} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Attending</label>
          <select bind:value={editedRsvp.attending} class="w-full p-2 border rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Vegetarian</label>
          <select bind:value={editedRsvp.is_vegetarian} class="w-full p-2 border rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Food Allergies</label>
          <input
            type="text"
            bind:value={editedRsvp.food_allergies}
            class="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Staying at Melrose</label>
          <select bind:value={editedRsvp.staying_at_melrose} class="w-full p-2 border rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Using Transport</label>
          <select bind:value={editedRsvp.using_transport} class="w-full p-2 border rounded">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Song Request</label>
          <input type="text" bind:value={editedRsvp.song} class="w-full p-2 border rounded" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
          <textarea bind:value={editedRsvp.special_notes} class="w-full p-2 border rounded" rows="3"
          ></textarea>
        </div>
      </div>
      <div class="mt-6 flex justify-end space-x-4">
        <button class="px-4 py-2 border rounded hover:bg-gray-50" on:click={cancelEdit}>
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          on:click={saveEdit}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}
