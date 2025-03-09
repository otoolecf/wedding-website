<script>
  import { onMount } from 'svelte';
  import { presetList, themePresets } from '$lib/theme/presets';

  let themeName = 'Custom Theme';
  let loading = true;

  onMount(async () => {
    try {
      const response = await fetch('/api/images/theme');
      if (response.ok) {
        const data = await response.json();

        // Try to identify if it's one of our presets by comparing colors and fonts
        const matchedPreset = findMatchingPreset(data.theme);
        if (matchedPreset) {
          themeName = matchedPreset.name;
        }
      }
    } catch (error) {
      console.error('Error fetching theme info', error);
    } finally {
      loading = false;
    }
  });

  function findMatchingPreset(theme) {
    if (!theme) return null;

    // Compare the current theme to each preset to find a match
    return presetList.find((preset) => {
      const presetTheme = themePresets[preset.id];

      // Check if all color values match
      const colorsMatch = Object.entries(presetTheme.colors).every(
        ([key, value]) => theme.colors[key]?.toLowerCase() === value.toLowerCase()
      );

      // Check if all font values match
      const fontsMatch = Object.entries(presetTheme.fonts).every(
        ([key, value]) => theme.fonts[key] === value
      );

      return colorsMatch && fontsMatch;
    });
  }
</script>

{#if !loading}
  <div class="text-sm font-medium py-1 px-2 rounded bg-accent inline-flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-primary"></span>
    <span>Theme: {themeName}</span>
  </div>
{/if}
