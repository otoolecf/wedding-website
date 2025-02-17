<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let images = writable([]);
  let selectedFile = null;
  let selectedImageId = null;

  onMount(async () => {
    await fetchImages();
  });

  async function fetchImages() {
    console.log('fetching images.');
    const response = await fetch('/api/images/gallery');
    const data = await response.json();
    console.log('fetching images, result data: ', data);
    images.set(data.images);
  }

  async function uploadImage() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('formData: appended! uploading.');
    const response = await fetch('/api/admin/gallery/upload', {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const data = await response.json();
      console.log('upload complete, response data: ', data);
      images.set(data.images);
    } else {
      console.error('Upload failed');
    }
  }

  async function deleteImage(galleryId) {
    console.log('deleteImage: galleryId: ', galleryId);
    const response = await fetch(`/api/admin/gallery/${galleryId}/remove`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('delete complete, response data: ', data);
      images.set(data.images);
    } else {
      console.error('Delete failed');
    }
  }

  async function saveOrder() {
    const response = await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      body: JSON.stringify({ images: $images })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('save order complete, response data: ', data);
      images.set(data.images);
    } else {
      console.error('Save order failed');
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
  <input type="file" class="mb-4" on:change={handleFileChange} />
  <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={uploadImage}>
    Upload Image
  </button>

  <div class="gallery mt-4">
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
        >
          Delete
        </button>
        <div class="flex justify-between mt-2">
          <button
            class="bg-gray-500 text-white px-2 py-1 rounded"
            on:click={() => moveImage(index, -1)}
            disabled={index === 0}
          >
            Left
          </button>
          <button
            class="bg-gray-500 text-white px-2 py-1 rounded"
            on:click={() => moveImage(index, 1)}
            disabled={index === $images.length - 1}
          >
            Right
          </button>
        </div>
      </div>
    {/each}
  </div>

  <button class="bg-green-500 text-white px-4 py-2 rounded mt-4" on:click={saveOrder}>
    Save Order
  </button>
</div>

<style>
  .gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .image-item {
    flex: 1 1 calc(33.333% - 1rem); /* Adjust based on the number of columns you want */
    box-sizing: border-box;
  }
</style>
