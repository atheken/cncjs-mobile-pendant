<script lang="ts">
	import type { AppController } from './AppController';
	import PendantState from './models/local/PendantState';
	export let model: AppController;

	let { active_port } = model;

	function disconnect() {
		let state = PendantState.instance;
		state.connection.autoconnect = false;
		state.save();
		model.close_connection();
	}
</script>

<button class="btn btn-error" disabled={!$active_port} on:click={() => disconnect()}>Disconnect</button>

<style>
</style>
