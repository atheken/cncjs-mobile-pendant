<style>
    .inuse {
        color: red;
    }

    .available {
        color: green;
    }
</style>

<script lang="ts">
    import type { Controller, SerialPort } from "./Controller";
    
    export let model:Controller;

    let {ports, active_port} = model;

    let selected:SerialPort;
</script>

<div>
    <form on:submit|preventDefault={()=>{}}>
        {#if $active_port?.port }
            Currently connected to: <span>{$active_port.port}</span>
            <button on:click={()=> model.close_connection() }>Disconnect</button>
        {:else}
            <select bind:value={selected}>
                {#each $ports as p(p.port)}
                <option class:inuse={p.inuse} class:available={!p.inuse} value={p}>{p.port}</option>
                {/each}
            </select>
            <button disabled={!selected} on:click={()=> model.open_connection(selected)}>Connect</button>
            <button on:click={()=> model.refresh_serial_list() }>Refresh</button>
        {/if}
    </form>
</div>