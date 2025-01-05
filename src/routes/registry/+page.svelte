<!-- src/routes/registry/+page.svelte -->
<script>
  const registries = [
    {
      name: "Target",
      url: "https://www.target.com/gift-registry/",
      image: "https://picsum.photos/seed/target/400/200",
      description: "Home essentials and decor"
    },
    {
      name: "Amazon",
      url: "https://www.amazon.com/wedding",
      image: "https://picsum.photos/seed/amazon/400/200",
      description: "Everything under the sun"
    },
    {
      name: "Crate & Barrel",
      url: "https://www.crateandbarrel.com/gift-registry",
      image: "https://picsum.photos/seed/crate/400/200",
      description: "Kitchen and entertaining must-haves"
    }
  ];
</script>

<svelte:head>
  <title>Registry | Connor's Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-6">Registry</h1>
  
  <p class="text-center text-gray-600 max-w-2xl mx-auto mb-12">
    Your presence at our wedding is the greatest gift of all. However, for those who have asked, we've created registries at the following stores:
  </p>

  <div class="grid md:grid-cols-3 gap-8">
    {#each registries as registry}
      <a 
        href={registry.url}
        target="_blank"
        rel="noopener noreferrer"
        class="block group"
      >
        <div class="bg-white p-6 rounded-lg text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <img 
            src={registry.image}
            alt={registry.name}
            class="w-full h-48 object-cover rounded mb-4"
          />
          <h2 class="text-xl font-medium mb-2 group-hover:text-gray-800">{registry.name}</h2>
          <p class="text-gray-600 text-sm">{registry.description}</p>
        </div>
      </a>
    {/each}
  </div>

  <div class="mt-12 text-center text-gray-600">
    <h2 class="text-2xl font-light mb-4">Honeymoon Fund</h2>
    <p class="max-w-2xl mx-auto">
      If you'd prefer to contribute to our honeymoon adventures, we've set up a honeymoon fund that you can find here:
    </p>
    <a 
      href="#" 
      class="inline-block mt-6 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
    >
      Contribute to Our Honeymoon
    </a>
  </div>
</div>