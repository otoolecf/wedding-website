<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  export let data;

  let daysUntil = 0;
  let formattedDate = '';
  let weddingSettings = null;

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      const data = await response.json();
      weddingSettings = data.settings;

      // Calculate days until wedding
      const weddingDateTime = new Date(
        `${weddingSettings.weddingDate}T${weddingSettings.weddingTime}`
      );
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weddingStart = new Date(
        weddingDateTime.getFullYear(),
        weddingDateTime.getMonth(),
        weddingDateTime.getDate()
      );
      daysUntil = Math.ceil((weddingStart - todayStart) / (1000 * 60 * 60 * 24));

      // Format the date string
      formattedDate = weddingDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Chicago'
      });
    } catch (error) {
      console.error('Error loading wedding settings:', error);
    }
  });
</script>

<svelte:head>
  <title
    >{data.isPreview ? 'Home' : 'Coming Soon'} | {weddingSettings?.groomName} & {weddingSettings?.brideName}'s
    Wedding</title
  >
</svelte:head>

{#if !data.isPreview}
  <!-- Coming Soon Page -->
  <div class="min-h-screen flex flex-col items-center justify-center px-4">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl font-light mb-6">
        {weddingSettings?.groomName} & {weddingSettings?.brideName}
      </h1>
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
      <h1 class="text-5xl font-light mb-6">
        {weddingSettings?.groomName} & {weddingSettings?.brideName}
      </h1>
      <p class="text-2xl mb-2">Are getting married!</p>
      <p class="text-xl mb-8">{formattedDate}</p>
      <div class="w-16 h-px mx-auto mb-8" style="background-color: var(--color-secondary)"></div>
      <div class="space-y-4">
        <p>Join us for our special day</p>
        <div class="flex justify-center">
          <a
            href={weddingSettings?.rsvpButtonLink}
            class="px-6 py-2 border rounded-full hover:bg-gray-50 transition-colors btn-outline"
          >
            {weddingSettings?.rsvpButtonText}
          </a>
        </div>
      </div>
    </div>
  </div>
{/if}
