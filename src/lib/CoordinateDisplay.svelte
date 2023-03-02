<script>
  export let coords;
</script>

<div class="container">
  <span class="item">
    {#if coords.work}
      Work {coords.work.x}, {coords.work.y}, {coords.work.z} Machine
    {/if}
  </span>
</div>

<style>
  .container {
    display: grid;
  }
</style>
