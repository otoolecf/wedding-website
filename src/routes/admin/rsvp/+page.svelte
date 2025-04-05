<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';

  let rsvps = [];
  let error = null;
  let stats = {
    totalResponses: 0,
    totalAttending: 0,
    totalNotAttending: 0,
    totalGuests: 0, // Including partners and +1s
    pendingResponses: 0
  };
  let showDeleteConfirm = false;
  let rsvpToDelete = null;

  // Fetch data on component mount
  onMount(async () => {
    try {
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
      const guestList = guestData.guests;

      // Calculate stats
      stats.totalResponses = rsvps.length;
      stats.totalAttending = rsvps.filter((r) => r.attending === 'yes').length;
      stats.totalNotAttending = rsvps.filter((r) => r.attending === 'no').length;

      // Calculate total guests (including partners and +1s)
      stats.totalGuests = rsvps
        .filter((r) => r.attending === 'yes')
        .reduce((sum, r) => sum + 1 + (r.guests || 0), 0);

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

  function downloadCsv() {
    const headers = [
      'Name',
      'Email',
      'Attending',
      'Additional Guests',
      'Dietary Requirements',
      'Song Request',
      'Submitted At'
    ];
    const csvContent = [
      headers.join(','),
      ...rsvps.map((rsvp) =>
        [
          rsvp.name,
          rsvp.email,
          rsvp.attending,
          rsvp.guests,
          `"${(rsvp.dietary_requirements || '').replace(/"/g, '""')}"`,
          `"${(rsvp.song || '').replace(/"/g, '""')}"`,
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
      stats.totalGuests = rsvps
        .filter((r) => r.attending === 'yes')
        .reduce((sum, r) => sum + 1 + (r.guests || 0), 0);

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
</script>

<AdminNav />

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">RSVP Dashboard</h1>
    <button
      on:click={downloadCsv}
      class="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
    >
      Download CSV
    </button>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else}
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Additional Guests</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Dietary Requirements</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Song Request</th
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
                  {#if rsvp.attending === 'yes' && rsvp.guests > 0}
                    <span class="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                      +{rsvp.guests}
                    </span>
                  {:else}
                    -
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs truncate">
                    {rsvp.dietary_requirements || '-'}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="max-w-xs truncate">
                    {rsvp.song || '-'}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {new Date(rsvp.created_at).toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    on:click={() => confirmDelete(rsvp)}
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
  {/if}
</div>

{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 class="text-lg font-medium mb-4">Confirm Delete</h3>
      <p class="mb-4">
        Are you sure you want to delete the RSVP for {rsvpToDelete.name}? This action cannot be
        undone.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          on:click={() => {
            showDeleteConfirm = false;
            rsvpToDelete = null;
          }}
          class="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          on:click={deleteRsvp}
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}
