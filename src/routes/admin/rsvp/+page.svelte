<script>
  import AdminNav from '$lib/components/AdminNav.svelte';

  let rsvps = [];
  let error = null;
  let stats = {
    totalGuests: 0,
    attending: 0,
    notAttending: 0
  };

  // Fetch data on component mount
  onMount(async () => {
    try {
      const response = await fetch('/api/admin/rsvps');
      if (!response.ok) {
        throw new Error(`Failed to fetch RSVPs: ${response.statusText}`);
      }

      const data = await response.json();
      rsvps = data.rsvps;

      // Calculate stats
      stats.attending = rsvps.filter((r) => r.attending === 'yes').length;
      stats.notAttending = rsvps.filter((r) => r.attending === 'no').length;
      stats.totalGuests = rsvps
        .filter((r) => r.attending === 'yes')
        .reduce((sum, r) => sum + (r.guests || 0) + 1, 0);
    } catch (err) {
      error = 'Failed to load RSVPs';
      console.error(err);
    }
  });

  import { onMount } from 'svelte';
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
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Total RSVPs</h3>
        <p class="text-3xl font-light">{rsvps.length}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Attending</h3>
        <p class="text-3xl font-light">{stats.attending}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h3 class="text-gray-500 text-sm">Total Guest Count</h3>
        <p class="text-3xl font-light">{stats.totalGuests}</p>
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Attending</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Dietary Requirements</th
              >
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Song</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >Submitted</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each rsvps as rsvp}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{rsvp.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">{rsvp.email}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class={`px-2 py-1 rounded-full text-xs ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {rsvp.attending}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{rsvp.guests || 0}</td>
                <td class="px-6 py-4">{rsvp.dietary_requirements || '-'}</td>
                <td class="px-6 py-4">{rsvp.song || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {new Date(rsvp.created_at).toLocaleString()}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
