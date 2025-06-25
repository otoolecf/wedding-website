<!-- src/routes/rsvp/+page.svelte -->
<script>
  import { formSettings } from '$lib/stores/formSettings';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';

  // Compute couple names based on order preference
  $: coupleNames =
    $page.data.settings.nameOrder === 'groom-first'
      ? `${$page.data.settings.groomName} & ${$page.data.settings.brideName}`
      : `${$page.data.settings.brideName} & ${$page.data.settings.groomName}`;

  let formData = {
    name: '',
    email: '',
    attending: '',
    guests: 0,
    is_vegetarian: '',
    food_allergies: '',
    lodging: '',
    using_transport: '',
    song: '',
    special_notes: ''
  };

  let partnerFormData = {
    name: '',
    attending: '',
    is_vegetarian: '',
    food_allergies: '',
    lodging: '',
    using_transport: '',
    song: '',
    special_notes: ''
  };

  let submitting = false;
  let submitted = false;
  let isUpdate = false;
  let error = null;
  let nameSearchResults = [];
  let searching = false;
  let guestInfo = null;
  let showPartnerForm = false;
  let settings = {};

  // Subscribe to form settings
  const unsubscribe = formSettings.subscribe((value) => {
    settings = value;
  });

  // Clean up subscription
  onDestroy(() => {
    unsubscribe();
  });

  // Load form settings on mount
  onMount(async () => {
    try {
      const response = await fetch('/api/admin/form-settings');
      if (response.ok) {
        const data = await response.json();
        formSettings.set(data);
      } else {
        // If the API call fails, use default settings
        console.warn('Failed to load form settings, using defaults');
      }
    } catch (error) {
      console.warn('Failed to load form settings, using defaults:', error);
    }
  });

  async function searchName() {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      nameSearchResults = [];
      guestInfo = null;
      showPartnerForm = false;
      return;
    }

    searching = true;
    try {
      const response = await fetch(
        `/api/guest-list/search?name=${encodeURIComponent(formData.name)}`
      );
      if (!response.ok) throw new Error('Failed to search guest list');
      const data = await response.json();
      nameSearchResults = data.results;
    } catch (e) {
      error = e.message;
    } finally {
      searching = false;
    }
  }

  function selectGuest(guest) {
    formData.name = guest.name;
    formData.email = guest.email || '';
    guestInfo = guest;
    nameSearchResults = [];

    if (guest.partner) {
      showPartnerForm = true;
      partnerFormData = {
        name: guest.partner.name,
        attending: '',
        is_vegetarian: '',
        food_allergies: '',
        lodging: '',
        using_transport: '',
        song: '',
        special_notes: ''
      };
    } else {
      showPartnerForm = false;
      partnerFormData = {
        name: '',
        attending: '',
        is_vegetarian: '',
        food_allergies: '',
        lodging: '',
        using_transport: '',
        song: '',
        special_notes: ''
      };
    }
  }

  async function handleSubmit() {
    if (!guestInfo) {
      error = 'Please search and select your name from the guest list';
      return;
    }

    const primaryRequired = ['attending'];
    if (formData.attending === 'yes') {
      primaryRequired.push('is_vegetarian', 'lodging', 'using_transport');
    }

    const missingPrimary = primaryRequired.filter((f) => !formData[f]);

    let missingPartner = [];
    if (showPartnerForm && partnerFormData.name) {
      const partnerRequired = ['attending'];
      if (partnerFormData.attending === 'yes') {
        partnerRequired.push('is_vegetarian', 'lodging', 'using_transport');
      }
      missingPartner = partnerRequired.filter((f) => !partnerFormData[f]);
    }

    if (missingPrimary.length > 0 || missingPartner.length > 0) {
      error = 'Please answer all required yes/no questions before submitting.';
      return;
    }

    submitting = true;
    error = null;

    try {
      // Prepare the request data
      const requestData = {
        primary: formData,
        partner: showPartnerForm && partnerFormData.name ? partnerFormData : null
      };

      // Submit RSVP in a single request
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to submit RSVP');
      }

      isUpdate = result.isUpdate;
      submitted = true;
    } catch (e) {
      error = e.message;
      console.error('RSVP Error:', e);
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>RSVP | {coupleNames} Wedding</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">RSVP</h1>

  {#if submitted}
    <div class="text-center py-12 bg-white rounded-lg shadow-sm">
      <h2 class="text-2xl mb-4">Thank you for your RSVP!</h2>
      <p class="text-gray-600">
        {#if isUpdate}
          Your RSVP has been successfully updated.
        {:else}
          We're excited to celebrate with you!
        {/if}
      </p>
      {#if isUpdate}
        <button
          class="mt-6 text-primary hover:text-primary/80 underline"
          on:click={() => {
            submitted = false;
            isUpdate = false;
            error = null;
          }}
        >
          Make another change
        </button>
      {/if}
    </div>
  {:else}
    <form
      on:submit|preventDefault={handleSubmit}
      class="space-y-6 bg-white p-8 rounded-lg shadow-sm"
    >
      <div class="space-y-2">
        <label for="name" class="block">{settings.nameLabel || 'Full Name'}</label>
        <div class="relative">
          <input
            type="text"
            id="name"
            bind:value={formData.name}
            on:input={searchName}
            required
            autocomplete="off"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style="focus-ring-color: var(--color-primary)"
            placeholder="Search your name..."
          />
          {#if searching}
            <div class="absolute right-2 top-2">
              <svg
                class="animate-spin h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          {/if}
          {#if nameSearchResults.length > 0}
            <div
              class="absolute left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg overflow-hidden"
            >
              {#each nameSearchResults as guest}
                <button
                  type="button"
                  on:click={() => selectGuest(guest)}
                  class="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {guest.name}
                  {#if guest.partner}
                    <span class="text-gray-500"> & {guest.partner.name}</span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      {#if guestInfo}
        <div class="space-y-6">
          <!-- Primary Guest Form -->
          <div class="bg-gray-50 p-6 rounded-lg space-y-6">
            <div class="border-b pb-4">
              <h3 class="text-xl font-medium">{guestInfo.name}'s RSVP</h3>
            </div>

            <div class="space-y-2">
              <label for="email" class="block">{settings.emailLabel || 'Email'}</label>
              <input
                type="email"
                id="email"
                bind:value={formData.email}
                required
                autocomplete="off"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style="focus-ring-color: var(--color-primary)"
              />
            </div>

            <div class="space-y-2">
              <label class="block">{settings.attendanceQuestion || 'Will you be attending?'}</label>
              <div class="space-x-4">
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    bind:group={formData.attending}
                    value="yes"
                    class="mr-2"
                    required
                  />
                  Yes
                </label>
                <label class="inline-flex items-center">
                  <input type="radio" bind:group={formData.attending} value="no" class="mr-2" />
                  No
                </label>
              </div>
            </div>

            {#if formData.attending === 'yes'}
              <div class="space-y-2">
                <label class="block">{settings.vegetarianQuestion || 'Are you vegetarian?'}</label>
                <div class="space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={formData.is_vegetarian}
                      value="yes"
                      class="mr-2"
                      required
                    />
                    Yes
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={formData.is_vegetarian}
                      value="no"
                      class="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <label for="food_allergies" class="block"
                  >{settings.foodAllergiesLabel || 'Any food allergies?'}</label
                >
                <textarea
                  id="food_allergies"
                  bind:value={formData.food_allergies}
                  rows="3"
                  autocomplete="off"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style="focus-ring-color: var(--color-primary)"
                ></textarea>
              </div>

              <div class="space-y-2">
                <label class="block"
                  >{settings.lodgingQuestion ||
                    'Are you planning on staying at the lodging?'}</label
                >
                <div class="space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={formData.lodging}
                      value="yes"
                      class="mr-2"
                      required
                    />
                    Yes
                  </label>
                  <label class="inline-flex items-center">
                    <input type="radio" bind:group={formData.lodging} value="no" class="mr-2" />
                    No
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block"
                  >{settings.transportQuestion ||
                    'Are you planning on joining the transport to and from our lodging?'}</label
                >
                <div class="space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={formData.using_transport}
                      value="yes"
                      class="mr-2"
                      required
                    />
                    Yes
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={formData.using_transport}
                      value="no"
                      class="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              <div class="space-y-2">
                <label for="song" class="block"
                  >{settings.songRequestLabel ||
                    'What song will get you on the dance floor?'}</label
                >
                <input
                  type="text"
                  id="song"
                  bind:value={formData.song}
                  autocomplete="off"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style="focus-ring-color: var(--color-primary)"
                />
              </div>

              <div class="space-y-2">
                <label for="special_notes" class="block"
                  >{settings.specialNotesLabel || 'Any special note for the couple?'}</label
                >
                <textarea
                  id="special_notes"
                  bind:value={formData.special_notes}
                  rows="3"
                  autocomplete="off"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style="focus-ring-color: var(--color-primary)"
                ></textarea>
              </div>
            {/if}
          </div>

          {#if showPartnerForm}
            <!-- Partner Form -->
            <div class="bg-gray-50 p-6 rounded-lg space-y-6">
              <div class="border-b pb-4">
                <h3 class="text-xl font-medium">{partnerFormData.name}'s RSVP</h3>
              </div>

              <div class="space-y-2">
                <label class="block">
                  {(settings.attendanceQuestion || 'Will you be attending?')
                    .replace(/\byou\b/gi, 'they')
                    .replace(/\bYou\b/g, 'They')}
                </label>
                <div class="space-x-4">
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={partnerFormData.attending}
                      value="yes"
                      class="mr-2"
                      required
                    />
                    Yes
                  </label>
                  <label class="inline-flex items-center">
                    <input
                      type="radio"
                      bind:group={partnerFormData.attending}
                      value="no"
                      class="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {#if partnerFormData.attending === 'yes'}
                <div class="space-y-2">
                  <label class="block">
                    {(settings.vegetarianQuestion || 'Are you vegetarian?')
                      .replace(/\byou\b/gi, 'they')
                      .replace(/\bYou\b/g, 'They')
                      .replace(/\bAre\b/g, 'Are')}
                  </label>
                  <div class="space-x-4">
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.is_vegetarian}
                        value="yes"
                        class="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.is_vegetarian}
                        value="no"
                        class="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="partner_food_allergies" class="block">
                    {settings.foodAllergiesLabel || 'Any food allergies?'}
                  </label>
                  <textarea
                    id="partner_food_allergies"
                    bind:value={partnerFormData.food_allergies}
                    rows="3"
                    autocomplete="off"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style="focus-ring-color: var(--color-primary)"
                  ></textarea>
                </div>

                <div class="space-y-2">
                  <label class="block">
                    {(settings.lodgingQuestion || 'Are you planning on staying at the lodging?')
                      .replace(/\byou\b/gi, 'they')
                      .replace(/\bYou\b/g, 'They')
                      .replace(/\bAre\b/g, 'Are')
                      .replace(/\byour\b/g, 'their')}
                  </label>
                  <div class="space-x-4">
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.lodging}
                        value="yes"
                        class="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.lodging}
                        value="no"
                        class="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block">
                    {(
                      settings.transportQuestion ||
                      'Are you planning on joining the transport to and from our lodging?'
                    )
                      .replace(/\byou\b/gi, 'they')
                      .replace(/\bYou\b/g, 'They')
                      .replace(/\bAre\b/g, 'Are')}
                  </label>
                  <div class="space-x-4">
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.using_transport}
                        value="yes"
                        class="mr-2"
                        required
                      />
                      Yes
                    </label>
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.using_transport}
                        value="no"
                        class="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="partner_song" class="block">
                    {(settings.songRequestLabel || 'What song will get you on the dance floor?')
                      .replace(/\byou\b/gi, 'them')
                      .replace(/\bYou\b/g, 'They')}
                  </label>
                  <input
                    type="text"
                    id="partner_song"
                    bind:value={partnerFormData.song}
                    autocomplete="off"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style="focus-ring-color: var(--color-primary)"
                  />
                </div>

                <div class="space-y-2">
                  <label for="partner_special_notes" class="block">
                    {settings.specialNotesLabel || 'Any special note for the couple?'}
                  </label>
                  <textarea
                    id="partner_special_notes"
                    bind:value={partnerFormData.special_notes}
                    rows="3"
                    autocomplete="off"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style="focus-ring-color: var(--color-primary)"
                  ></textarea>
                </div>
              {/if}
            </div>
          {/if}

          <div class="pt-6">
            <button
              type="submit"
              disabled={submitting}
              class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit RSVP'}
            </button>
          </div>
        </div>
      {:else}
        <div class="text-center py-8 text-gray-500">
          <p>Please search and select your name to continue with your RSVP.</p>
        </div>
      {/if}

      {#if error}
        <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
          {error}
        </div>
      {/if}
    </form>
  {/if}
</div>
