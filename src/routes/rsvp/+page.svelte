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

  let submitting = false;
  let submitted = false;
  let error = null;

  async function handleSubmit() {
    submitting = true;
    error = null;

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // First get the raw text
      const responseText = await response.text();

      let result;
      try {
        // Then try to parse it as JSON
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }

      if (!response.ok) throw new Error(result.error || 'Failed to submit RSVP');

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
        <input
          type="text"
          id="name"
          bind:value={formData.name}
          required
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style="focus-ring-color: var(--color-primary)"
        />
      </div>

      <div class="space-y-2">
        <label for="email" class="block">Email</label>
        <input
          type="email"
          id="email"
          bind:value={formData.email}
          required
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
        <div class="space-y-2">
          <label for="guests" class="block">Number of Additional Guests</label>
          <input
            type="number"
            id="guests"
            bind:value={formData.guests}
            min="0"
            max="4"
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style="focus-ring-color: var(--color-primary)"
          />
        </div>

        <div class="space-y-2">
          <label for="dietary" class="block">Dietary Requirements</label>
          <textarea
            id="dietary"
            bind:value={formData.dietaryRequirements}
            rows="3"
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
            class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style="focus-ring-color: var(--color-primary)"
            placeholder="What song will get you on the dance floor?"
          />
        </div>
      {/if}

      {#if error}
        <div class="p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      {/if}

      <button
        type="submit"
        class="w-full py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 btn-primary"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit RSVP'}
      </button>
    </form>
  {/if}
</div>
