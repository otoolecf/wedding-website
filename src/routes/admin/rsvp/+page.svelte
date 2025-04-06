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
  let activeTab = 'dashboard';
  let settings = {};
  let emailTemplate = '';
  let editorInitialized = false;
  let editorStatus = { loading: false, error: null };

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

      await loadEmailTemplate();
    } catch (err) {
      error = 'Failed to load RSVPs';
      console.error(err);
    }
  });

  async function loadEmailTemplate() {
    try {
      const response = await fetch('/api/admin/email-template');
      if (response.ok) {
        const data = await response.json();
        // Replace the form_data placeholder with a special marker that won't be interpreted as a template literal
        emailTemplate = data.template.replace(/\${form_data}/g, 'FORM_DATA_PLACEHOLDER');
      }
    } catch (err) {
      console.error('Error loading email template:', err);
    }
  }

  async function saveEmailTemplate() {
    try {
      // Replace the special marker back with the form_data placeholder before saving
      const templateToSave = emailTemplate.replace(/FORM_DATA_PLACEHOLDER/g, '${form_data}');

      const response = await fetch('/api/admin/email-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ template: templateToSave })
      });

      if (response.ok) {
        alert('Email template saved successfully!');
      } else {
        throw new Error('Failed to save email template');
      }
    } catch (err) {
      error = err.message;
      console.error('Error saving email template:', err);
    }
  }

  function getPartnerName(rsvp) {
    const guest = guestList.find((g) => g.name === rsvp.name);
    return guest?.partner_name || '';
  }

  function downloadCsv() {
    const headers = [
      'Name',
      'Partner Name',
      'Email',
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
          `"${rsvp.name.replace(/"/g, '""')}"`,
          `"${getPartnerName(rsvp).replace(/"/g, '""')}"`,
          `"${rsvp.email.replace(/"/g, '""')}"`,
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `wedding-rsvps-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);
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

  function loadTinyMCE() {
    if (typeof window === 'undefined') return;

    if (!window.tinymce) {
      editorStatus.loading = true;
      console.log('Loading TinyMCE script...');

      // Try multiple CDN sources in case one fails
      const cdnUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.6.0/tinymce.min.js',
        'https://cdn.jsdelivr.net/npm/tinymce@6.6.0/tinymce.min.js',
        'https://cdn.tiny.cloud/1/no-api-key/tinymce/6.6.0/tinymce.min.js'
      ];

      // Try to load TinyMCE from one of the CDNs
      const loadScript = (index) => {
        if (index >= cdnUrls.length) {
          console.error('All TinyMCE CDN attempts failed');
          editorStatus.loading = false;
          editorStatus.error = 'Failed to load editor. Please try refreshing the page.';
          return;
        }

        const script = document.createElement('script');
        script.src = cdnUrls[index];
        script.onload = () => {
          console.log('TinyMCE script loaded successfully');
          editorStatus.loading = false;
          initializeEditor();
        };
        script.onerror = () => {
          console.error('Error loading TinyMCE from:', cdnUrls[index]);
          // Try the next CDN
          loadScript(index + 1);
        };
        document.head.appendChild(script);
      };

      // Start with the first CDN
      loadScript(0);
    } else {
      console.log('TinyMCE already loaded');
      initializeEditor();
    }
  }

  function initializeEditor() {
    if (!window.tinymce || editorInitialized) return;

    const editorConfig = {
      selector: '#email-template-editor',
      height: 400,
      menubar: false,
      plugins: 'lists link code table',
      toolbar: [
        'undo redo | blocks | bold italic underline | forecolor backcolor | removeformat',
        'alignleft aligncenter alignright | bullist numlist | link | code'
      ],
      block_formats:
        'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Quote=blockquote',
      content_style: `
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; }
        .mce-content-body p { margin: 0; }
        h1 { font-size: 2rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        h4 { font-size: 1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        blockquote { border-left: 4px solid #ccc; padding-left: 1rem; font-style: italic; }
      `,
      setup: (ed) => {
        ed.on('init', () => {
          console.log('Editor initialized');
          ed.setContent(emailTemplate);
          editorInitialized = true;
        });

        ed.on('change', () => {
          emailTemplate = ed.getContent();
        });
      }
    };

    window.tinymce
      .init(editorConfig)
      .then(() => {
        console.log('TinyMCE editor successfully initialized');
      })
      .catch((err) => {
        console.error('Failed to initialize TinyMCE editor:', err);
        editorStatus.error = 'Failed to initialize editor. Please try refreshing the page.';
      });
  }

  onMount(() => {
    loadTinyMCE();
  });

  onDestroy(() => {
    if (window.tinymce) {
      window.tinymce.remove('#email-template-editor');
    }
  });
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

  <!-- Add tabs navigation -->
  <div class="border-b border-gray-200 mb-8">
    <nav class="-mb-px flex space-x-8">
      <button
        class={`${
          activeTab === 'dashboard'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        on:click={() => setActiveTab('dashboard')}
      >
        Dashboard
      </button>
      <button
        class={`${
          activeTab === 'settings'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        on:click={() => setActiveTab('settings')}
      >
        Form Settings
      </button>
      <button
        class={`${
          activeTab === 'email'
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        on:click={() => setActiveTab('email')}
      >
        Email Template
      </button>
    </nav>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else if activeTab === 'dashboard'}
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
  {:else if activeTab === 'settings'}
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-medium mb-6">Form Settings</h2>
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Name Field Label</label>
          <input
            type="text"
            bind:value={settings.nameLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Full Name"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Email Field Label</label>
          <input
            type="text"
            bind:value={settings.emailLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Email"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Attendance Question</label>
          <input
            type="text"
            bind:value={settings.attendanceQuestion}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Will you be attending?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Additional Guests Label</label>
          <input
            type="text"
            bind:value={settings.additionalGuestsLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Number of Additional Guests"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Vegetarian Question</label>
          <input
            type="text"
            bind:value={settings.vegetarianQuestion}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Are you vegetarian?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Food Allergies Label</label>
          <input
            type="text"
            bind:value={settings.foodAllergiesLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any food allergies?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Lodging Question</label>
          <input
            type="text"
            bind:value={settings.lodgingQuestion}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Are you planning on staying at the lodging?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Transport Question</label>
          <input
            type="text"
            bind:value={settings.transportQuestion}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Are you planning on joining the transport to and from our lodging?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Song Request Label</label>
          <input
            type="text"
            bind:value={settings.songRequestLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What song will get you on the dance floor?"
          />
        </div>
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Special Notes Label</label>
          <input
            type="text"
            bind:value={settings.specialNotesLabel}
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any special note for the couple?"
          />
        </div>
        <div class="flex justify-end">
          <button
            on:click={handleSaveSettings}
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  {:else if activeTab === 'email'}
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-medium mb-6">Email Template</h2>
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Template Content</label>
          <div class="border rounded">
            <div id="email-template-editor" class="editor-container"></div>
            <div class="p-4 text-sm bg-gray-50 text-gray-600 border-t">
              <h4 class="font-medium mb-2">How to use this editor:</h4>
              <p class="mb-4">
                This editor allows you to customize the text that appears before and after the RSVP
                form data in the confirmation email. The form data section will be automatically
                inserted where you place the <code>${form_data}</code> placeholder.
              </p>

              <h4 class="font-medium mb-2">Example Structure:</h4>
              <pre class="bg-white p-3 rounded border mb-4 text-xs">
&lt;h2&gt;Thank you for your RSVP!&lt;/h2&gt;
&lt;p&gt;Here's a summary of your response:&lt;/p&gt;

${form_data}

&lt;p&gt;If you need to make any changes to your RSVP, please contact us directly.&lt;/p&gt;
&lt;p&gt;We look forward to celebrating with you!&lt;/p&gt;</pre>

              <h4 class="font-medium mb-2">Available Placeholder:</h4>
              <p class="mb-2">Use this placeholder in your template:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>
                  <code>${form_data}</code> - This will be replaced with the guest's form responses,
                  including partner information if applicable
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            on:click={saveEmailTemplate}
            class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Save Template
          </button>
        </div>
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
