<!-- src/routes/lodging/+page.svelte -->
<script>
</script>

<svelte:head>
  <title>Lodging | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Lodging Options</h1>

  <!-- Wedding Venue Section -->
  <div class="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-sm">
    <div class="md:w-1/2 space-y-4">
      <h2 class="text-2xl mb-6 text-center md:text-left text-primary">Melrose River Club</h2>
      <div class="space-y-4 text-center md:text-left">
        <p class="text-xl">Boutique on the San Marcos River!</p>
        <p class="font-medium">Don't be full by the sourroundings, the location is prime!</p>
      </div>
    </div>
    <div class="md:w-1/2">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png"
        alt="Melrose"
        class="w-full h-full object-cover rounded-lg"
      />
    </div>
  </div>

  <!-- Accommodation Section -->
  <div class="mt-12 flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-sm">
    <div class="md:w-1/2 order-2 md:order-1">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png"
        alt="Crystal River Inn"
        class="w-full h-full object-cover rounded-lg"
      />
    </div>
    <div class="md:w-1/2 space-y-4 order-1 md:order-2">
      <h2 class="text-2xl mb-6 text-center md:text-left text-primary">Crystal River Inn</h2>
      <div class="space-y-4 text-center md:text-left">
        <p>The crystal river inn is a small B&B in San Marcos!</p>
        <p class="text-secondary">Not associated with the wedding.</p>
      </div>
    </div>
  </div>
</div>
