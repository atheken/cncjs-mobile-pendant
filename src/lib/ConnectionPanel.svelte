<script lang="ts" context="module">
	export let displayPanel = writable(false);
</script>

<script lang="ts">
	import Modal from './Modal.svelte';
	import type { Controller, SerialPort } from './Controller';
	import Icon from './Icon.svelte';
	import PendantState from './PendantState';
	import { derived, writable } from 'svelte/store';
	export let model: Controller;

	let { ports, active_port } = model;

	let state = PendantState.instance;

	ports.subscribe((p) => {
		let port = state.connection?.port;
		if (state.connection.autoconnect && p.find((f) => f.port == port)) {
			connect();
		}
	});

	function connect() {
		state.save();
		model.open_connection(state.connection);
		displayPanel.set(false);
	}

	function disconnect() {
		let state = PendantState.instance;
		model.close_connection();
		state.connection.autoconnect = false;
		state.save();
		displayPanel.set(false);
	}

	let disableConnect = derived(model.active_port, (p) => p.port);
	let rates = [115200, 9600];
</script>

<Modal visible={$displayPanel} on:dismiss-requested={() => displayPanel.set(false)}>
	<span slot="heading">Connection Options</span>
	<div slot="content" class="w-full">
		<div>
			<label class="block"
				>Serial Port:
				<select class="select-primary select select-sm w-2/3" bind:value={state.connection.port}>
					{#each $ports as p (p.port)}
						<option value={p.port} selected={state.connection.port == p.port}>{p.port}</option>
					{/each}
				</select>
				<button class="btn-outline btn-sm btn" on:click={() => model.refresh_serial_list()}
					><Icon icon="refresh" /></button>
			</label>
			<label class="block">
				Baud Rate:
				<select bind:value={state.connection.baud_rate}>
					{#each rates as r (r)}
						<option value={r} selected={state.connection.baud_rate == r}>{r}</option>
					{/each}
				</select>
			</label>
			<div class="form-control w-full">
				<label for="reconnect">
					<input type="checkbox" id="reconnect" class="toggle" bind:checked={state.connection.autoconnect} />
					Connect Automatically</label>
			</div>
			<div class="form-control w-full">
				<label for="reconnect">
					<input type="checkbox" id="reconnect" class="toggle" bind:checked={state.connection.enable_hardware_flow_control} />
					Use Hardware Flow Control</label>
			</div>
		</div>
		<button
			class="btn-error btn-sm btn justify-end text-left"
			disabled={$active_port?.port == null}
			on:click={() => disconnect()}>
			Disconnect</button>
		<button
			class="btn-success btn-sm btn justify-end text-right"
			disabled={!state.connection.port}
			on:click={() => connect()}>
			Connect</button>
	</div>
</Modal>
