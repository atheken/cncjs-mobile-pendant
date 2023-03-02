<script lang=ts>
    import { onMount, createEventDispatcher } from "svelte";
    import { get, writable} from "svelte/store";
    import type { Controller } from "./Controller";
    import type { DirectoryEntry } from "./DirectoryListing";
    
    export let model:Controller
    export let path = writable("")

    let dispatch = createEventDispatcher()
    let selectedEntry:DirectoryEntry

    function select_entry(selection:DirectoryEntry){
        if(selection.type == 'f'){
            selectedEntry = selection;
            dispatch("file-selected", `${$path}/${selection.name}`);
        }else
        {
            set_path(`${$path}/${selection.name}`)
        }
    }

    let invalidator = new Date();

    function set_path(new_path:string){
        selectedEntry = null;
        path.set(new_path.replaceAll(/(^\/)|(\/$)/g,''));
        invalidator = new Date();
    }

</script>
<div>
    <div class="text-sm breadcrumbs">
        <ul>
            <li><a class=link on:click={()=> set_path("")}>&lt;root&gt;</a></li>
            {#each $path.split('/') as s, i }
            <li><a class=link on:click={()=>set_path($path.split('/').slice(0, i + 1).join('/'))}>{s}</a></li>
            {/each}
    </div>
    {#key invalidator}
    {#await model.list_files($path)}
        <div class="text-center align-middle text-secondary">
            Loading file list...
        </div>
    {:then listing}
    {#if listing.files.length == 0}
        <div class="text-center align-middle text-secondary">This directory is empty.</div>
    {:else}
    <div class="overflow-x-auto">
        <table class="table table-compact w-full">
            <thead>
                <th>Name</th>
                <th>Last Modified</th>
            </thead>
            <tbody>
                {#each listing.files as f(f.name) }
                <tr class="hover cursor-pointer" on:click={()=> select_entry(f) } class:active={f == selectedEntry }>
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