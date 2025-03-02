<!-- src/routes/story/+page.svelte -->
<script>
  const milestones = [
    {
      date: 'Fall 2015',
      title: 'How We Met',
      description: 'An awkward waiting around aggregiously early to an 8 AM friday physics class',
      // Change this:
      // image: '/api/placeholder/400/300'
      // To this:
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png'
    },
    {
      date: 'August 26, 2024',
      title: 'The Proposal',
      description: `After hours of driving with no food and a dissapointing stop at a closed Anderson's Pea Soup, a grumpy Colette went on a hike where Connor was walking too fast.`,
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png'
    }
  ];
</script>

<svelte:head>
  <title>Our Story | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Our Story</h1>

  <div class="space-y-16">
    {#each milestones as milestone, i}
      <div
        class="flex flex-col md:flex-row gap-8 items-center {i % 2 ? 'md:flex-row-reverse' : ''}"
      >
        <div class="flex-1">
          <img src={milestone.image} alt={milestone.title} class="rounded-lg shadow-lg w-full" />
        </div>
        <div class="flex-1 text-center md:text-left">
          <div class="text-gray-500 mb-2">{milestone.date}</div>
          <h2 class="text-2xl mb-4">{milestone.title}</h2>
          <p class="text-gray-600 leading-relaxed">{milestone.description}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
