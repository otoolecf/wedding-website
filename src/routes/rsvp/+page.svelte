<!-- src/routes/rsvp/+page.svelte -->
<script>
  let formData = {
    name: '',
    email: '',
    attending: 'yes',
    guests: 0,
    dietaryRequirements: '',
    song: ''
  };

  let partnerFormData = {
    name: '',
    email: '',
    attending: 'yes',
    dietaryRequirements: '',
    song: ''
  };

  let submitting = false;
  let submitted = false;
  let error = null;
  let nameSearchResults = [];
  let searching = false;
  let guestInfo = null;
  let showPartnerForm = false;

  async function searchName() {
    if (!formData.name.trim()) {
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
      partnerFormData.name = guest.partner.name;
      partnerFormData.email = guest.partner.email || '';
    } else {
      showPartnerForm = false;
      partnerFormData = {
        name: '',
        email: '',
        attending: 'yes',
        dietaryRequirements: '',
        song: ''
      };
    }
  }

  async function handleSubmit() {
    if (!guestInfo) {
      error = 'Please search and select your name from the guest list';
      return;
    }

    if (guestInfo.plus_one_allowed === false && formData.guests > 0) {
      error = 'You are not allowed to bring additional guests';
      return;
    }

    submitting = true;
    error = null;

    try {
      // Submit primary guest's RSVP
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      if (!response.ok) throw new Error(result.error || 'Failed to submit RSVP');

      // If there's a partner, submit their RSVP too
      if (showPartnerForm && partnerFormData.name) {
        const partnerResponse = await fetch('/api/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(partnerFormData)
        });

        const partnerResponseText = await partnerResponse.text();
        try {
          result = JSON.parse(partnerResponseText);
        } catch (e) {
          throw new Error(`Server returned invalid JSON: ${partnerResponseText}`);
        }

        if (!partnerResponse.ok) throw new Error(result.error || 'Failed to submit partner RSVP');
      }

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
  <title>RSVP | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">RSVP</h1>

  {#if submitted}
    <div class="text-center py-12 bg-white rounded-lg shadow-sm">
      <h2 class="text-2xl mb-4">Thank you for your RSVP!</h2>
      <p class="text-gray-600">We're excited to celebrate with you!</p>
    </div>
  {:else}
    <form
      on:submit|preventDefault={handleSubmit}
      class="space-y-6 bg-white p-8 rounded-lg shadow-sm"
    >
      <div class="space-y-2">
        <label for="name" class="block">Full Name</label>
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
          <div class="space-y-2">
            <label for="email" class="block">Email</label>
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
            <label class="block">Will you be attending?</label>
            <div class="space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" bind:group={formData.attending} value="yes" class="mr-2" />
                Yes
              </label>
              <label class="inline-flex items-center">
                <input type="radio" bind:group={formData.attending} value="no" class="mr-2" />
                No
              </label>
            </div>
          </div>

          {#if formData.attending === 'yes'}
            {#if guestInfo.plus_one_allowed}
              <div class="space-y-2">
                <label for="guests" class="block">Number of Additional Guests</label>
                <input
                  type="number"
                  id="guests"
                  bind:value={formData.guests}
                  min="0"
                  max="4"
                  autocomplete="off"
                  class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style="focus-ring-color: var(--color-primary)"
                />
              </div>
            {/if}

            <div class="space-y-2">
              <label for="dietary" class="block">Dietary Requirements</label>
              <textarea
                id="dietary"
                bind:value={formData.dietaryRequirements}
                rows="3"
                autocomplete="off"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style="focus-ring-color: var(--color-primary)"
              ></textarea>
            </div>

            <div class="space-y-2">
              <label for="song" class="block">Song Request</label>
              <input
                type="text"
                id="song"
                bind:value={formData.song}
                autocomplete="off"
                class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style="focus-ring-color: var(--color-primary)"
                placeholder="What song will get you on the dance floor?"
              />
            </div>
          {/if}

          {#if showPartnerForm}
            <div class="border-t pt-6 mt-6">
              <h3 class="text-lg font-medium mb-4">Partner/Spouse Information</h3>
              <div class="space-y-4">
                <div class="space-y-2">
                  <label for="partner_email" class="block">Email</label>
                  <input
                    type="email"
                    id="partner_email"
                    bind:value={partnerFormData.email}
                    required
                    autocomplete="off"
                    class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style="focus-ring-color: var(--color-primary)"
                  />
                </div>

                <div class="space-y-2">
                  <label class="block">Will they be attending?</label>
                  <div class="space-x-4">
                    <label class="inline-flex items-center">
                      <input
                        type="radio"
                        bind:group={partnerFormData.attending}
                        value="yes"
                        class="mr-2"
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
                    <label for="partner_dietary" class="block">Dietary Requirements</label>
                    <textarea
                      id="partner_dietary"
                      bind:value={partnerFormData.dietaryRequirements}
                      rows="3"
                      autocomplete="off"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style="focus-ring-color: var(--color-primary)"
                    ></textarea>
                  </div>

                  <div class="space-y-2">
                    <label for="partner_song" class="block">Song Request</label>
                    <input
                      type="text"
                      id="partner_song"
                      bind:value={partnerFormData.song}
                      autocomplete="off"
                      class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style="focus-ring-color: var(--color-primary)"
                      placeholder="What song will get them on the dance floor?"
                    />
                  </div>
                {/if}
              </div>
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
    </form>
  {/if}
</div>
