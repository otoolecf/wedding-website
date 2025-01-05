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

  function handleSubmit() {
    // For now, just log the data
    console.log('RSVP Submitted:', formData);
    alert('Thank you for your RSVP! This is just a demo for now.');
  }
</script>

<svelte:head>
  <title>RSVP | Connor's Wedding</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">RSVP</h1>

  <form on:submit|preventDefault={handleSubmit} class="space-y-6 bg-white p-8 rounded-lg shadow-sm">
    <div class="space-y-2">
      <label for="name" class="block text-gray-700">Full Name</label>
      <input
        type="text"
        id="name"
        bind:value={formData.name}
        required
        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
    </div>

    <div class="space-y-2">
      <label for="email" class="block text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        bind:value={formData.email}
        required
        class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-gray-700">Will you be attending?</label>
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
        <label for="guests" class="block text-gray-700">Number of Additional Guests</label>
        <input
          type="number"
          id="guests"
          bind:value={formData.guests}
          min="0"
          max="4"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <div class="space-y-2">
        <label for="dietary" class="block text-gray-700">Dietary Requirements</label>
        <textarea
          id="dietary"
          bind:value={formData.dietaryRequirements}
          rows="3"
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
        ></textarea>
      </div>

      <div class="space-y-2">
        <label for="song" class="block text-gray-700">Song Request</label>
        <input
          type="text"
          id="song"
          bind:value={formData.song}
          class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
          placeholder="What song will get you on the dance floor?"
        />
      </div>
    {/if}

    <button
      type="submit"
      class="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
    >
      Submit RSVP
    </button>
  </form>
</div>