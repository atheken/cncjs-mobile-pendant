<script lang="ts">
  import type { Controller } from './Controller';
  import type { DirectoryEntry } from './DirectoryListing';

  export let model: Controller;
  export let file_path: string;
  export let selected_file: DirectoryEntry = null;

  function select_entry(selection: DirectoryEntry) {
    if (selection.type == 'f') {
      selected_file = selection;
    } else {
      set_path(`${file_path}/${selection.name}`);
    }
  }

  let invalidator = new Date();

  function set_path(new_path: string) {
    selected_file = null;
    file_path = new_path.replaceAll(/(^\/)|(\/$)/g, '');
    invalidator = new Date();
  }
</script>

<div>
  <div class="breadcrumbs text-sm">
    <ul>
      <li><a class="link" on:click={() => set_path('')}>&lt;root&gt;</a></li>
      {#each file_path.split('/') as s, i}
        <li>
          <a
            class="link"
            on:click={() =>
              set_path(file_path
                  .split('/')
                  .slice(0, i + 1)
                  .join('/')
              )}>{s}</a
          >
        </li>
      {/each}
    </ul>
  </div>
  {#key invalidator}
    {#await model.list_files(file_path)}
      <div class="text-center align-middle text-secondary">Loading file list...</div>
    {:then listing}
      {#if listing.files.length == 0}
        <div class="text-center align-middle text-secondary">This directory is empty.</div>
      {:else}
        <div class="overflow-x-auto">
          <table class="table-compact table w-full">
            <thead>
              <th>Name</th>
              <th>Last Modified</th>
            </thead>
            <tbody>
              {#each listing.files as f (f.name)}
                <tr class="hover cursor-pointer" on:click={() => select_entry(f)} class:active={f == selected_file}>
                  <td>{f.name}</td>
                  <td>{f.mtime}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {/await}
  {/key}
</div>
