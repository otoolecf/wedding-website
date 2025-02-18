<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Initialize the store with an empty array
  let images = writable([]);

  images.subscribe((value) => {
    console.log('images updated, new images: ', value);
  });

  let selectedFile = null;
  let selectedImageId = null;
  let fetching = false;
  let uploading = false;
  let deleting = false;
  let saving = false;
  let error = null;

  onMount(async () => {
    await fetchImages();
  });

  async function fetchImages() {
    fetching = true;
    error = null;
    console.log('fetching images.');
    try {
      const response = await fetch('/api/images/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      console.log('fetching images, result data: ', data);
      images.set(data.images);
    } catch (err) {
      error = 'Failed to load images';
      console.error(err);
    } finally {
      fetching = false;
    }
  }

  async function uploadImage() {
    if (!selectedFile) return;

    uploading = true;
    error = null;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('galleryState', JSON.stringify({ images: $images })); // Ensure $images is always an array

    console.log('formData: appended! uploading.');
    try {
      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('upload complete, response data: ', data);
        images.set(data.images); // Update the store with the new images
        console.log();
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
    try {
      const response = await fetch(`/api/admin/gallery/${galleryId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ images: $images })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('delete complete, response data: ', data);
        images.set(data.images); // Update the store with the new images
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
        console.log('save order complete, response data: ', data);
        images.set(data.images); // Update the store with the new images
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
</script>

<div class="p-4">
  <h1 class="text-2xl font-bold mb-4">Admin Panel</h1>
  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-4">
      {error}
    </div>
  {/if}
  <input type="file" class="mb-4" on:change={handleFileChange} />
  <button
    class="bg-blue-500 text-white px-4 py-2 rounded"
    on:click={uploadImage}
    disabled={uploading}
  >
    {#if uploading}
      Uploading...
    {:else}
      Upload Image
    {/if}
  </button>

  <div class="gallery mt-4">
    {#if fetching}
      <p>Loading images...</p>
    {:else if $images.length === 0}
      <p>No images available. Upload your first image!</p>
    {:else}
      {#each $images as image, index (image.kv_id)}
        <div
          class="image-item relative border p-2 rounded shadow-md cursor-pointer"
          role="option"
          tabindex="0"
          aria-selected={selectedImageId === image.id}
          on:click={() => handleImageClick(image.kv_id)}
          on:keydown={(event) => handleKeyDown(event, image.kv_id)}
        >
          <img src={image.src} alt={image.id} class="w-full h-32 object-cover rounded" />
          <button
            class="delete-button absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            on:click={() => deleteImage(image.kv_id)}
            disabled={deleting}
          >
            {#if deleting && selectedImageId === image.kv_id}
              Deleting...
            {:else}
              Delete
            {/if}
          </button>
          <div class="flex justify-between mt-2">
            <button
              class="bg-gray-500 text-white px-2 py-1 rounded"
              on:click={() => moveImage(index, -1)}
              disabled={index === 0 || saving}
            >
              Left
            </button>
            <button
              class="bg-gray-500 text-white px-2 py-1 rounded"
              on:click={() => moveImage(index, 1)}
              disabled={index === $images.length - 1 || saving}
            >
              Right
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <button
    class="bg-green-500 text-white px-4 py-2 rounded mt-4"
    on:click={saveOrder}
    disabled={saving}
  >
    {#if saving}
      Saving Order...
    {:else}
      Save Order
    {/if}
  </button>
</div>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .image-item {
    flex: 1 1 calc(33.333% - 1rem); /* Adjust to one-third of the container width for three columns */
    box-sizing: border-box;
  }
</style>
