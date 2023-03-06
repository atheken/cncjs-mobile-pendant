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

	let selected: SerialPort = null;

	let state = PendantState.instance;

	ports.subscribe((p) => {
		let port = state.connection?.port;
		if (selected == null && port) {
			selected = p.find((k) => k.port == port);
		}
		if (state.connection.autoconnect && selected) {
			connect();
		}
	});

	function connect() {
		state.connection.port = selected.port;
		state.save();
		model.open_connection(selected);
		selected = null;
		displayPanel.set(false);
	}

	function disconnect() {
		let state = PendantState.instance;
		state.connection.autoconnect = false;
		state.save();
		model.close_connection();
		displayPanel.set(false);
	}

	let disableConnect = derived(model.active_port, (p) => p.port)
</script>

<Modal visible={$displayPanel} on:dismiss-requested={() => displayPanel.set(false)}>
	<span slot="heading">Connection Options</span>
	<div slot="content" class="w-full">
		<div>
			<label class="block"
				>Serial Port:
				<select class="select-primary select select-sm w-2/3" bind:value={selected}>
					{#each $ports as p (p.port)}
						<option class:inuse={p.inuse} class:available={!p.inuse} value={p}>{p.port}</option>
					{/each}
				</select>
				<button class="btn-outline btn-sm btn" on:click={() => model.refresh_serial_list()}
					><Icon icon="refresh" /></button>
			</label>
			<div class="form-control w-full">
				<label for="reconnect">
					<input type="checkbox" id="reconnect" class="toggle" bind:checked={state.connection.autoconnect} />
					Connect Automatically</label>
			</div>
		</div>
		<button
			class="btn-error btn-sm btn justify-end text-left"
			disabled={$active_port?.port == null}
			on:click={() => disconnect()}>
			Disconnect</button>
		<button class="btn-success btn-sm btn justify-end text-right" disabled={!selected} on:click={() => connect()}>
			Connect</button>
	</div>
</Modal>
