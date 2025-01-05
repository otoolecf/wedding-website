<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  // You can customize these dates
  const weddingDate = new Date('2026-04-18');
  let daysUntil = 0;

  onMount(() => {
    const today = new Date();
    daysUntil = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24));
  });
</script>

<svelte:head>
  <title>Coming Soon | Connor & Colette's Wedding</title>
</svelte:head>

<div
  class="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-gray-50"
>
  <div class="text-center max-w-2xl mx-auto">
    <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
    <p class="text-2xl text-gray-600 mb-8">Are getting married in {daysUntil} days</p>
    <div class="w-16 h-px bg-gray-300 mx-auto mb-8"></div>
    <p class="text-gray-500 mb-12">Website coming soon</p>

    <!-- Optional: Add an email collection form -->
    <div class="max-w-md mx-auto">
      <form class="flex gap-4 justify-center">
        <input
          type="email"
          placeholder="Enter your email for updates"
          class="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <button
          type="submit"
          class="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          Notify Me
        </button>
      </form>
    </div>
  </div>
</div>
