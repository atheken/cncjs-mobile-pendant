<style>
    .inuse {
        color: red;
    }
    .available {
        color: green;
    }
</style>

<script lang="ts">
    import type { Controller, SerialPort} from "./Controller";
    export let model:Controller;

    let {ports, active_port} = model;

    let selected:SerialPort;
</script>
{#if !$active_port?.port }
<div class="modal-open modal">
<div class="modal-box">
    <h4>Please a serial port on which to connect:</h4>
    <select class="select select-primary" bind:value={selected}>
        {#each $ports as p(p.port)}
        <option class:inuse={p.inuse} class:available={!p.inuse} value={p}>{p.port}</option>
        {/each}
    </select>
<div class="modal-action">
    <button class="btn btn-success" disabled={!selected} on:click={()=> { model.open_connection(selected); selected = null; } }>Connect</button>
    <button class="btn btn-primary" on:click={()=> model.refresh_serial_list() }>Refresh</button>
</div>
</div>
</div>
{/if}