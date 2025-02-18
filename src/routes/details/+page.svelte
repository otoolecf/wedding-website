<!-- src/routes/details/+page.svelte -->
<script>
  const details = {
    wedding: {
      time: '4:00 PM',
      date: 'April 18, 2026',
      location: 'Windemere Farms',
      address: '200 Windermere Rd, San Marcos, TX 78666',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png'
    },
    accommodation: {
      hotel: 'Melrose River Club',
      code: 'WEDDING2026',
      note: 'Reserve your room!',
      address: '70 Riverbend Dr, San Marcos, TX 78666',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png'
    }
  };
</script>

<svelte:head>
  <title>Details | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Wedding Details</h1>

  <!-- Wedding Venue Section -->
  <div class="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-sm">
    <div class="md:w-1/2 space-y-4">
      <h2 class="text-2xl mb-6 text-center md:text-left">Wedding</h2>
      <div class="space-y-4 text-center md:text-left">
        <p class="text-xl">{details.wedding.time}</p>
        <p>{details.wedding.date}</p>
        <p class="font-medium">{details.wedding.location}</p>
        <p class="text-gray-600">{details.wedding.address}</p>
      </div>
    </div>
    <div class="md:w-1/2">
      <img
        src={details.wedding.image}
        alt="Wedding Venue"
        class="w-full h-full object-cover rounded-lg"
      />
    </div>
  </div>

  <!-- Accommodation Section -->
  <div class="mt-12 flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-sm">
    <div class="md:w-1/2 order-2 md:order-1">
      <img
        src={details.accommodation.image}
        alt="Accommodation"
        class="w-full h-full object-cover rounded-lg"
      />
    </div>
    <div class="md:w-1/2 space-y-4 order-1 md:order-2">
      <h2 class="text-2xl mb-6 text-center md:text-left">Accommodation</h2>
      <div class="space-y-4 text-center md:text-left">
        <p class="font-medium">{details.accommodation.hotel}</p>
        <p class="text-gray-600">{details.accommodation.address}</p>
        <p>Booking Code: <span class="font-mono">{details.accommodation.code}</span></p>
        <p class="text-gray-600">{details.accommodation.note}</p>
      </div>
    </div>
  </div>
</div>
