<script lang="ts">
  import type { Controller } from './Controller';
  import PendantState from './PendantState';
  export let model: Controller;

  let { active_port } = model;

  function disconnect() {
    let state = PendantState.instance;
    state.connection.autoconnect = false;
    state.save();
    model.close_connection();
  }
</script>

<button class="btn-error btn" disabled={!$active_port} on:click={() => disconnect()}>Disconnect</button>

<style>
</style>
