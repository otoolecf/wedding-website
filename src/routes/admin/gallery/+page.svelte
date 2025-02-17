<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  let images = writable([]);
  let selectedFile = null;
  let draggingItem = null;
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

    const response = await fetch('/api/admin/gallery/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      await fetchImages();
    } else {
      console.error('Upload failed');
    }
  }

  async function deleteImage(galleryId) {
    const response = await fetch(`/api/admin/gallery/${galleryId}/remove`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await fetchImages();
    } else {
      console.error('Delete failed');
    }
  }

  async function reorderImages(galleryKey, newIndex) {
    const response = await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      body: JSON.stringify({ gallery_key: galleryKey, new_idx: newIndex })
    });

    if (response.ok) {
      await fetchImages();
    } else {
      console.error('Reorder failed');
    }
  }

  function handleFileChange(event) {
    selectedFile = event.target.files[0];
  }

  function handleDragStart(event, galleryKey) {
    draggingItem = galleryKey;
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  async function handleDrop(event, targetKey) {
    event.preventDefault();
    if (draggingItem && targetKey !== draggingItem) {
      const newIndex = $images.findIndex((img) => img.id === targetKey);
      await reorderImages(draggingItem, newIndex);
    }
    draggingItem = null;
  }

  function handleImageClick(imageId) {
    selectedImageId = imageId;
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
  <button class="bg-blue-500 text-white px-4 py-2 rounded" on:click={uploadImage}
    >Upload Image</button
  >

  <div class="gallery grid grid-cols-3 gap-4 mt-4">
    {#each $images as image (image.id)}
      <div
        class="image-item relative border p-2 rounded shadow-md cursor-grab"
        role="option"
        tabindex="0"
        aria-selected={selectedImageId === image.id}
        on:click={() => handleImageClick(image.id)}
        on:keydown={(event) => handleKeyDown(event, image.id)}
        draggable="true"
        on:dragstart={(event) => handleDragStart(event, image.id)}
        on:dragover={handleDragOver}
        on:drop={(event) => handleDrop(event, image.id)}
      >
        <img src={image.src} alt={image.id} class="w-full h-32 object-cover rounded" />
        <button
          class="delete-button absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
          on:click={() => deleteImage(image.id)}>Delete</button
        >
      </div>
    {/each}
  </div>
</div>
