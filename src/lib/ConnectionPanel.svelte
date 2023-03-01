<style>
</style>

<script lang="ts">
    import type { Controller, SerialPort} from "./Controller";
    import PendantState from "./PendantState";
    export let model:Controller;

    let {ports, active_port} = model;

    let selected:SerialPort = null;

    let state = PendantState.load();
    
    ports.subscribe(p => {
        let port = state.connection?.port;
        if(selected == null && port){
            selected = p.find(k=>k.port == port)
        }
        if(state.connection.autoconnect && selected){
            connect();
        }
    });

    function connect() {
        state.connection.port = selected.port;
        state.save();
        model.open_connection(selected);
        selected = null;
    }
</script>
{#if !$active_port?.port }
<div class="modal-open modal">
<div class="modal-box">
    <h4>Please select a serial port on which to connect:</h4>
    <select class="select select-primary" bind:value={selected}>
        {#each $ports as p(p.port)}
        <option class:inuse={p.inuse} class:available={!p.inuse} value={p}>{p.port}</option>
        {/each}
    </select> <button class="btn btn-outline btn-info" on:click={()=> model.refresh_serial_list() }>Refresh</button>
    <div class="form-control">
        <input type=checkbox id=reconnect class=checkbox bind:checked={state.connection.autoconnect} /> <label for=reconnect>Connect Automatically</label>
    </div>
    
    <div class="modal-action">
    <button class="btn btn-success" disabled={!selected} on:click={() => connect()}>Connect</button>
</div>
</div>
</div>
{/if}