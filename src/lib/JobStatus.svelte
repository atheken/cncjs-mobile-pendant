<script lang="ts">
  import type { Controller } from './Controller';
  import type { DirectoryEntry } from './DirectoryListing';
  import FileBrowser from './FileBrowser.svelte';

  export let model: Controller;
  let state = model.workflow_state;

  let status = state.status;
  let load_file_requested = false;
  let selected_file: DirectoryEntry;
  let file_path = '';

  function display_modal() {
    load_file_requested = true;
  }

  function load_file() {
    load_file_requested = false;
    console.debug(`Selected file requested to load: ${selected_file.name}`);
  }
</script>

<div>
  <div class:blur-sm={load_file_requested}>
    Status: {$status}
    <button class="btn" on:click={() => display_modal()}>Load File</button>
  </div>
  <div class="modal" class:modal-open={load_file_requested} on:keyup={(e) => console.log(e.code)}>
    <div class="modal-box">
      <FileBrowser {model} bind:selected_file bind:file_path />
      <div class="modal-action">
        <button disabled={!selected_file} class="btn" on:click={() => load_file()}>Select file</button>
      </div>
    </div>
  </div>
</div>
