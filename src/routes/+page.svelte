<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  export let data;

  // Set the wedding date with a specific time in your timezone
  const weddingDate = new Date('2026-04-18T16:00:00'); // 4:00 PM on your wedding day
  let daysUntil = 0;
  let formattedDate = '';

  onMount(() => {
    // Calculate days until wedding, handling timezone differences
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weddingStart = new Date(
      weddingDate.getFullYear(),
      weddingDate.getMonth(),
      weddingDate.getDate()
    );
    daysUntil = Math.ceil((weddingStart - todayStart) / (1000 * 60 * 60 * 24));

    // Format the date string
    formattedDate = weddingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Chicago' // Specify Central timezone
    });
  });
</script>

<svelte:head>
  <title>{data.isPreview ? 'Home' : 'Coming Soon'} | Connor & Colette's Wedding</title>
</svelte:head>

{#if !data.isPreview}
  <!-- Coming Soon Page -->
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
      <p class="text-2xl mb-2">Are getting married in {daysUntil} days</p>
      <p class="text-xl mb-8">{formattedDate}</p>
      <div class="w-16 h-px mx-auto mb-8" style="background-color: var(--color-secondary)"></div>
      <p>Website coming soon</p>
    </div>
  </div>
{:else}
  <!-- Full Home Page for Preview -->
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
      <p class="text-2xl mb-2">Are getting married!</p>
      <p class="text-xl mb-8">{formattedDate}</p>
      <div class="w-16 h-px mx-auto mb-8" style="background-color: var(--color-secondary)"></div>
      <div class="space-y-4">
        <p>Join us for our special day</p>
        <div class="flex justify-center gap-4">
          <a href="/details" class="px-6 py-2 rounded-full transition-colors btn-primary">
            View Details
          </a>
          <a
            href="/rsvp"
            class="px-6 py-2 border rounded-full hover:bg-gray-50 transition-colors btn-outline"
          >
            RSVP Now
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
