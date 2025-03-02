// src/lib/imageAssignments.js
import { IMAGE_LOCATIONS } from './imageLocations';

/**
 * The data structure stored in KV will be:
 *
 * KV Keys:
 * - "gallery_order": Array of image IDs in display order for the gallery
 * - "image:{uuid}": Metadata for a specific image including r2_key, alt text, etc.
 * - "image_assignments": Object mapping location IDs to image IDs
 *
 * Example image_assignments structure:
 * {
 *   "story_how_we_met": "550e8400-e29b-41d4-a716-446655440000",
 *   "details_venue": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
 * }
 */

/**
 * Fetches all current image assignments
 */
export async function fetchImageAssignments(platform) {
  const assignments = await platform.env.IMAGES_KV.get('image_assignments');
  return assignments ? JSON.parse(assignments) : {};
}

/**
 * Updates an image assignment
 */
export async function assignImage(platform, locationId, imageId) {
  // Validate the location ID is recognized
  if (!Object.values(IMAGE_LOCATIONS).includes(locationId)) {
    throw new Error(`Invalid location ID: ${locationId}`);
  }

  // Get current assignments
  const assignments = await fetchImageAssignments(platform);

  // Update the assignment
  assignments[locationId] = imageId;

  // Save back to KV
  await platform.env.IMAGES_KV.put('image_assignments', JSON.stringify(assignments));

  return { success: true, assignments };
}

/**
 * Removes an image assignment
 */
export async function removeAssignment(platform, locationId) {
  // Get current assignments
  const assignments = await fetchImageAssignments(platform);

  // Remove the assignment
  delete assignments[locationId];

  // Save back to KV
  await platform.env.IMAGES_KV.put('image_assignments', JSON.stringify(assignments));

  return { success: true, assignments };
}

/**
 * Gets an image assigned to a specific location
 */
export async function getAssignedImage(platform, locationId) {
  const assignments = await fetchImageAssignments(platform);
  const imageId = assignments[locationId];

  if (!imageId) {
    return null;
  }

  // Fetch the image metadata
  const imageData = await platform.env.IMAGES_KV.get(`image:${imageId}`);
  if (!imageData) {
    return null;
  }

  const metadata = JSON.parse(imageData);
  return {
    id: imageId,
    kv_id: `image:${imageId}`,
    src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${metadata.r2_key}`,
    alt: metadata.alt || '',
    caption: metadata.caption || '',
    r2_key: metadata.r2_key
  };
}

/**
 * Checks if an image is being used in any assignments
 * Helpful for warning before deletion
 */
export async function getImageAssignments(platform, imageId) {
  const assignments = await fetchImageAssignments(platform);

  const locations = [];
  for (const [location, assignedImageId] of Object.entries(assignments)) {
    if (assignedImageId === imageId) {
      locations.push(location);
    }
  }

  return locations;
}
