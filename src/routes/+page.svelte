<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  export let data;

  let daysUntil;
  let formattedDate;

  // Compute couple names based on order preference
  $: coupleNames =
    data.settings.nameOrder === 'groom-first'
      ? `${data.settings.groomName} & ${data.settings.brideName}`
      : `${data.settings.brideName} & ${data.settings.groomName}`;

  // Calculate days until wedding
  $: {
    const weddingDate = new Date(data.settings.weddingDate);
    const today = new Date();
    const diffTime = weddingDate - today;
    daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Format wedding date
  $: {
    const date = new Date(data.settings.weddingDate);
    formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>{coupleNames}'s Wedding</title>
</svelte:head>

{#if data.isPreview}
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 class="text-4xl font-bold mb-8">{coupleNames}</h1>

    {#if data.settings.showCountdown}
      <div class="text-2xl mb-8">
        {daysUntil} days until our wedding
      </div>
    {/if}

    <div class="text-xl mb-8">
      {formattedDate}
    </div>

    <div class="text-lg mb-8">
      {data.settings.venueName}
    </div>

    <div class="text-lg mb-8">
      {data.settings.venueAddress}
    </div>

    <a
      href="/rsvp"
      class="bg-primary text-white px-8 py-3 rounded-full text-lg hover:bg-primary/90 transition-colors"
    >
      RSVP
    </a>
  </div>
{:else}
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <h1 class="text-4xl font-bold mb-8">Welcome to Our Wedding Website</h1>
    <p class="text-lg mb-8">Please log in to view the wedding details.</p>
    <a
      href="/admin"
      class="bg-primary text-white px-8 py-3 rounded-full text-lg hover:bg-primary/90 transition-colors"
    >
      Admin Login
    </a>
  </div>
{/if}
