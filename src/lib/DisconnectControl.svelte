<style>
</style>

<script lang="ts">
    import type { Controller } from "./Controller";
    import PendantState from "./PendantState";
    export let model:Controller;

    let {active_port} = model;

    function disconnect() {
        let state = PendantState.load();
        state.connection.autoconnect = false;
        state.save();
        model.close_connection();
    }
</script>

<button class="btn btn-error" disabled={!$active_port} on:click={()=> disconnect()}>Disconnect</button>