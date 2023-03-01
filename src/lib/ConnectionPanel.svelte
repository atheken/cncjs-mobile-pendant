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

<div style="text-align: center">
    <form on:submit|preventDefault={()=>{}}>
        {#if $active_port?.port }
            Currently connected to: <span>{$active_port.port}</span>
            <br/>
            <button class="btn danger" on:click={()=> model.close_connection() }>Disconnect</button>
        {:else}
            <div class="info-text">
                Please a serial port on which to connect:
            </div>
            <select class=select bind:value={selected}>
                {#each $ports as p(p.port)}
                <option class:inuse={p.inuse} class:available={!p.inuse} value={p}>{p.port}</option>
                {/each}
            </select><br/>
            <button class=btn disabled={!selected} on:click={()=> { model.open_connection(selected); selected = null; } }>Connect</button>
            <button class=btn on:click={()=> model.refresh_serial_list() }>Refresh</button>
        {/if}
    </form>
</div>