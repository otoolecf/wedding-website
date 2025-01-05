<!-- src/routes/+page.svelte -->
<script>
  const weddingDate = new Date('2026-04-18'); // Update with your actual date
</script>

<svelte:head>
  <title>Connor and Colette's Wedding</title>
</svelte:head>

<div class="hero min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
  <div class="text-center px-4">
    <h1 class="text-5xl font-light mb-6">Connor & Colette</h1>
    <p class="text-xl text-gray-600 mb-8">
      {weddingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
    <a 
      href="/rsvp" 
      class="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
    >
      RSVP Now
    </a>
  </div>
</div>

<section class="max-w-4xl mx-auto px-4 py-16 text-center">
  <h2 class="text-3xl mb-6">Join Us in Celebration</h2>
  <p class="text-gray-600 max-w-2xl mx-auto">
    Get down, clown around, and wear a gown with no frowns. We're getting htiched!
  </p>
</section>
