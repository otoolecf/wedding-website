<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl mb-4">Debug Information</h1>
    <pre class="text-left bg-gray-100 p-4 rounded">
      Error: {$page.error?.message}
      Status: {$page.status}
      Branch: {$page.data?.branch}
      Path: {$page.url.pathname}
    </pre>
  </div>
</div>
