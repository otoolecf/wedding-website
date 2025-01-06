<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  export let data;

  const weddingDate = new Date('2026-04-18');
  let daysUntil = 0;
  let formattedDate = '';

  onMount(() => {
    const today = new Date();
    daysUntil = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));

    formattedDate = weddingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
</script>

<svelte:head>
  <title>{data.isPreview ? 'Home' : 'Coming Soon'} | Connor & Colette's Wedding</title>
</svelte:head>

{#if !data.isPreview}
  <!-- Coming Soon Page -->
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50"
  >
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
      <p class="text-2xl text-gray-600 mb-2">Are getting married in {daysUntil} days</p>
      <p class="text-xl text-gray-500 mb-8">{formattedDate}</p>
      <div class="w-16 h-px bg-gray-300 mx-auto mb-8"></div>
      <p class="text-gray-500">Website coming soon</p>
    </div>
  </div>
{:else}
  <!-- Full Home Page for Preview -->
  <div
    class="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50"
  >
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
      <p class="text-2xl text-gray-600 mb-2">Are getting married!</p>
      <p class="text-xl text-gray-500 mb-8">{formattedDate}</p>
      <div class="w-16 h-px bg-gray-300 mx-auto mb-8"></div>
      <div class="space-y-4">
        <p class="text-gray-600">Join us for our special day</p>
        <div class="flex justify-center gap-4">
          <a
            href="/details"
            class="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            View Details
          </a>
          <a
            href="/rsvp"
            class="px-6 py-2 border border-black rounded-full hover:bg-gray-50 transition-colors"
          >
            RSVP Now
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
