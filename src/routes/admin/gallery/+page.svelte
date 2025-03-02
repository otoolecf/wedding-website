<!-- src/routes/admin/gallery/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { getAllImageLocationIds, getImageLocationName } from '$lib/imageLocations';

  // Initialize the stores
  let images = writable([]);
  let assignments = writable({});
  let locationOptions = getAllImageLocationIds();

  // UI state variables
  let selectedFile = null;
  let selectedImageId = null;
  let selectedLocationId = null;
  let showAssignmentModal = false;
  let showEditModal = false;
  let editingImage = null;
  let editCaption = '';
  let editAlt = '';
  let fetching = false;
  let uploading = false;
  let deleting = false;
  let saving = false;
  let assigning = false;
  let editing = false;
  let error = null;

  // Fetch both images and assignments on mount
  onMount(async () => {
    await Promise.all([fetchImages(), fetchAssignments()]);
  });

  async function fetchImages() {
    fetching = true;
    error = null;
    console.log('Fetching images.');
    try {
      const response = await fetch('/api/images/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      console.log('Fetched images, result data: ', data);
      images.set(data.images);
    } catch (err) {
      error = 'Failed to load images';
      console.error(err);
    } finally {
      fetching = false;
    }
  }

  async function fetchAssignments() {
    try {
      const response = await fetch('/api/admin/gallery/assignments');
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      const data = await response.json();
      console.log('Fetched assignments: ', data.assignments);
      assignments.set(data.assignments);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  }

  async function uploadImage() {
    if (!selectedFile) return;

    uploading = true;
    error = null;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('galleryState', JSON.stringify({ images: $images }));

    // Add caption and alt text if provided
    const uploadCaption = document.getElementById('uploadCaption').value;
    const uploadAlt = document.getElementById('uploadAlt').value;
    if (uploadCaption) formData.append('caption', uploadCaption);
    if (uploadAlt) formData.append('alt', uploadAlt);

    console.log('FormData: appended! Uploading.');
    try {
      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload complete, response data: ', data);
        images.set(data.images);
        // Reset the form
        selectedFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('uploadCaption').value = '';
        document.getElementById('uploadAlt').value = '';
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      error = 'Upload failed';
      console.error(err);
    } finally {
      uploading = false;
    }
  }

  async function deleteImage(galleryId) {
    deleting = true;
    error = null;
    console.log('deleteImage: galleryId: ', galleryId);

    // Check if image is assigned to any location
    const imageId = galleryId.replace('image:', '');
    const usedLocations = getAssignedLocations(imageId);

    if (usedLocations.length > 0) {
      const confirmDelete = confirm(
        `This image is currently assigned to: ${usedLocations.map((loc) => getImageLocationName(loc)).join(', ')}.\n\nDeleting it will remove these assignments. Continue?`
      );

      if (!confirmDelete) {
        deleting = false;
        return;
      }
    }

    try {
      const response = await fetch(`/api/admin/gallery/${galleryId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ images: $images })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Delete complete, response data: ', data);
        images.set(data.images);

        // If the image was assigned anywhere, also fetch updated assignments
        if (usedLocations.length > 0) {
          await fetchAssignments();
        }
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      error = 'Delete failed';
      console.error(err);
    } finally {
      deleting = false;
    }
  }

  async function saveOrder() {
    saving = true;
    error = null;
    try {
      const response = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        body: JSON.stringify({ images: $images })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Save order complete, response data: ', data);
        images.set(data.images);
      } else {
        throw new Error('Save order failed');
      }
    } catch (err) {
      error = 'Save order failed';
      console.error(err);
    } finally {
      saving = false;
    }
  }

  function moveImage(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < $images.length) {
      const updatedImages = [...$images];
      const [movedImage] = updatedImages.splice(index, 1);
      updatedImages.splice(newIndex, 0, movedImage);
      images.set(updatedImages);
    }
  }

  function handleFileChange(event) {
    selectedFile = event.target.files[0];
    console.log('handleFileChange: selectedFile: ', selectedFile);
  }

  function handleImageClick(imageId) {
    selectedImageId = imageId;
    console.log('handleImageClick: selectedImageId: ', selectedImageId);
  }

  function handleKeyDown(event, imageId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleImageClick(imageId);
    }
  }

  function openAssignmentModal(imageId) {
    selectedImageId = imageId;
    showAssignmentModal = true;
  }

  function closeAssignmentModal() {
    showAssignmentModal = false;
    selectedLocationId = null;
  }

  function openEditModal(image) {
    editingImage = image;
    editCaption = image.caption || '';
    editAlt = image.alt || '';
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingImage = null;
    editCaption = '';
    editAlt = '';
  }

  async function saveImageMetadata() {
    if (!editingImage) return;

    editing = true;
    try {
      const response = await fetch('/api/admin/gallery/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId: editingImage.id,
          caption: editCaption,
          alt: editAlt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update image metadata');
      }

      // Update the image in our local state
      const updatedImages = $images.map((img) => {
        if (img.id === editingImage.id) {
          return { ...img, caption: editCaption, alt: editAlt };
        }
        return img;
      });

      images.set(updatedImages);
      closeEditModal();
    } catch (err) {
      console.error('Failed to update image metadata:', err);
      error = 'Failed to update image metadata';
    } finally {
      editing = false;
    }
  }

  async function assignImageToLocation() {
    if (!selectedImageId || !selectedLocationId) return;

    assigning = true;
    try {
      const imageId = selectedImageId.replace('image:', '');
      const response = await fetch('/api/admin/gallery/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageId,
          locationId: selectedLocationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to assign image');
      }

      const data = await response.json();
      assignments.set(data.assignments);

      closeAssignmentModal();
      alert(`Image successfully assigned to ${getImageLocationName(selectedLocationId)}`);
    } catch (err) {
      console.error('Failed to assign image:', err);
      error = 'Failed to assign image';
    } finally {
      assigning = false;
    }
  }

  function getAssignedLocations(imageId) {
    return Object.entries($assignments)
      .filter(([, assignedId]) => assignedId === imageId)
      .map(([locationId]) => locationId);
  }

  function getImageAssignmentInfo(imageId) {
    const locations = getAssignedLocations(imageId.replace('image:', ''));

    if (locations.length === 0) {
      return 'Not assigned';
    }

    if (locations.length === 1) {
      return `Assigned to: ${getImageLocationName(locations[0])}`;
    }

    return `Assigned to ${locations.length} locations`;
  }
</script>

<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">Gallery Admin Panel</h1>
  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-4">
      {error}
    </div>
  {/if}

  <div class="gallery mt-4">
    {#if fetching}
      <p>Loading images...</p>
    {:else if $images.length === 0}
      <p>No images available. Upload your first image!</p>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each $images as image, index (image.kv_id)}
          <div
            class="image-item relative border p-2 rounded shadow-md"
            role="option"
            tabindex="0"
            aria-selected={selectedImageId === image.kv_id}
            on:click={() => handleImageClick(image.kv_id)}
            on:keydown={(event) => handleKeyDown(event, image.kv_id)}
          >
            <img src={image.src} alt={image.id} class="w-full h-32 object-cover rounded mb-2" />

            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-500">ID: {image.id}</span>
              <span class="text-xs italic">{getImageAssignmentInfo(image.id)}</span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                class="delete-button bg-red-500 text-white px-2 py-1 rounded text-sm"
                on:click={() => deleteImage(image.kv_id)}
                disabled={deleting}
              >
                {#if deleting && selectedImageId === image.kv_id}
                  Deleting...
                {:else}
                  Delete
                {/if}
              </button>

              <button
                class="bg-green-500 text-white px-2 py-1 rounded text-sm"
                on:click={() => openAssignmentModal(image.id)}
              >
                Assign
              </button>

              <button
                class="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                on:click={() => openEditModal(image)}
              >
                Edit Info
              </button>
            </div>

            <div class="flex justify-between mt-2">
              <button
                class="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                on:click={() => moveImage(index, -1)}
                disabled={index === 0 || saving}
              >
                Left
              </button>
              <button
                class="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                on:click={() => moveImage(index, 1)}
                disabled={index === $images.length - 1 || saving}
              >
                Right
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <button
    class="bg-green-500 text-white px-4 py-2 rounded mt-4"
    on:click={saveOrder}
    disabled={saving || $images.length === 0}
  >
    {#if saving}
      Saving Order...
    {:else}
      Save Order
    {/if}
  </button>

  <!-- Assignment Modal -->
  {#if showAssignmentModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Assign Image</h2>

        <div class="mb-4">
          <label for="locationSelect" class="block text-sm font-medium text-gray-700 mb-1">
            Select Location
          </label>
          <select
            id="locationSelect"
            bind:value={selectedLocationId}
            class="w-full p-2 border rounded"
          >
            <option value="">Select a location...</option>
            {#each locationOptions as locationId}
              <option value={locationId}>{getImageLocationName(locationId)}</option>
            {/each}
          </select>

          {#if selectedLocationId && $assignments[selectedLocationId]}
            <p class="mt-2 text-yellow-600 text-sm">
              This location already has an assigned image. Continuing will replace it.
            </p>
          {/if}
        </div>

        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 border rounded" on:click={closeAssignmentModal}> Cancel </button>
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded"
            on:click={assignImageToLocation}
            disabled={!selectedLocationId || assigning}
          >
            {#if assigning}
              Assigning...
            {:else}
              Assign Image
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Metadata Modal -->
  {#if showEditModal && editingImage}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Edit Image Information</h2>

        <div class="mb-6">
          <img
            src={editingImage.src}
            alt={editingImage.alt || 'Preview'}
            class="w-full h-48 object-contain mb-4 border rounded"
          />

          <div class="mb-4">
            <label for="imageCaption" class="block text-sm font-medium text-gray-700 mb-1">
              Caption
            </label>
            <input
              id="imageCaption"
              type="text"
              bind:value={editCaption}
              class="w-full p-2 border rounded"
              placeholder="Add a caption for this image..."
            />
            <p class="mt-1 text-xs text-gray-500">
              Captions are displayed in the gallery and lightbox view
            </p>
          </div>

          <div class="mb-4">
            <label for="imageAlt" class="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <input
              id="imageAlt"
              type="text"
              bind:value={editAlt}
              class="w-full p-2 border rounded"
              placeholder="Describe the image for accessibility..."
            />
            <p class="mt-1 text-xs text-gray-500">
              Alt text helps with accessibility and is not visible to regular users
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 border rounded" on:click={closeEditModal}> Cancel </button>
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded"
            on:click={saveImageMetadata}
            disabled={editing}
          >
            {#if editing}
              Saving...
            {:else}
              Save Changes
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
