// src/lib/imageLocations.js
/**
 * Defines all possible image assignment locations across the website
 * This serves as a registry of all places where images can be assigned
 */
export const IMAGE_LOCATIONS = {
  // Our Story page
  STORY_HOW_WE_MET: 'story_how_we_met',
  STORY_PROPOSAL: 'story_proposal',

  // Details page
  DETAILS_VENUE: 'details_venue',
  DETAILS_ACCOMMODATION: 'details_accommodation',

  // Lodging page
  LODGING_MELROSE: 'lodging_melrose',
  LODGING_CRYSTAL_RIVER: 'lodging_crystal_river',

  // Registry items (if you want custom images for each)
  REGISTRY_TARGET: 'registry_target',
  REGISTRY_AMAZON: 'registry_amazon',
  REGISTRY_CRATE_BARREL: 'registry_crate_barrel'

  // Add more locations as needed when your site expands
};

/**
 * Helper function to get all available location IDs
 * Useful for admin interfaces and validation
 */
export function getAllImageLocationIds() {
  return Object.values(IMAGE_LOCATIONS);
}

/**
 * Helper function to get human-readable names for each location ID
 * Useful for admin interfaces
 */
export function getImageLocationName(locationId) {
  const names = {
    [IMAGE_LOCATIONS.STORY_HOW_WE_MET]: 'Our Story - How We Met',
    [IMAGE_LOCATIONS.STORY_PROPOSAL]: 'Our Story - The Proposal',
    [IMAGE_LOCATIONS.DETAILS_VENUE]: 'Details - Wedding Venue',
    [IMAGE_LOCATIONS.DETAILS_ACCOMMODATION]: 'Details - Accommodation',
    [IMAGE_LOCATIONS.LODGING_MELROSE]: 'Lodging - Melrose River Club',
    [IMAGE_LOCATIONS.LODGING_CRYSTAL_RIVER]: 'Lodging - Crystal River Inn',
    [IMAGE_LOCATIONS.REGISTRY_TARGET]: 'Registry - Target',
    [IMAGE_LOCATIONS.REGISTRY_AMAZON]: 'Registry - Amazon',
    [IMAGE_LOCATIONS.REGISTRY_CRATE_BARREL]: 'Registry - Crate & Barrel'
  };

  return names[locationId] || locationId;
}
