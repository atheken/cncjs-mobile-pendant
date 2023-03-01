<script lang=ts>
    import { onMount } from "svelte";
    import { writable} from "svelte/store";
    import type { Controller } from "./Controller";
    import DirectoryListing from "./DirectoryListing";

    export let model:Controller
    export let path = ""

    let files = writable<DirectoryListing>(new DirectoryListing())
    
    onMount(async ()=>{
        files.set(await model.list_files(path));
    })

</script>
{#if files}
<ul>
    {#each $files.files as f(f.name) }
    <li>
        {#if f.type == 'f'}
            <div>{f.name}</div>
        {:else}
            <this model=model path=f.name>{f.name}</this>
        {/if}
    </li>
    {/each}
</ul>
{/if}