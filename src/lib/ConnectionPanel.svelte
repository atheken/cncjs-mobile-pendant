<style>
    .inuse {
        color: red;
    }

    .available {
        color: green;
    }

</style>

<script lang="ts">
    import type { Controller } from "./Controller";
    export let model:Controller;

    let ports = model.ports
    
</script>

<div>
    <select>
        {#each $ports as p(p.port)}
        <option class:inuse={p.inuse} class:available={!p.inuse}>{p.port}</option>
        {/each}
    </select>
    <button on:click={()=> model.refresh_serial_list()}>Refresh</button>
</div>