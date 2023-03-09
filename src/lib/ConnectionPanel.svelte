<script lang="ts" context="module">
	export let displayPanel = writable(false);
	let hasAutoconnected = false;
</script>

<script lang="ts">
	import Modal from './Modal.svelte';
	import type { AppController } from './AppController';

	import PendantState from './models/local/PendantState';
	import { writable } from 'svelte/store';
	import Icon from './Icon.svelte';
	export let model: AppController;

	let { ports, active_port } = model;

	let state = PendantState.instance;

	ports.subscribe((p) => {
		let port = state.connection?.port;
		if (state.connection.autoconnect && p.find((f) => f.port == port) && !hasAutoconnected) {
			connect();
			//once we have autoconnected the first time,
			// we don't want the app to do it again until page reload.
			hasAutoconnected = true;
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

	let rates = [115200, 9600];
</script>

<Modal visible={$displayPanel} on:dismiss-requested={() => displayPanel.set(false)}>
	<span slot="heading">Connection Options</span>
	<div slot="content" class="grid grid-cols-1 place-items-center">
		<div class="flex">
			<label
				>Serial Port:
				<select class="border-1 select select-sm border-slate-200" bind:value={state.connection.port}>
					{#each $ports as p (p.port)}
						<option value={p.port} selected={state.connection.port == p.port}>{p.port}</option>
					{/each}
				</select>
				<button
					class="border-1 btn-sm btn bg-slate-200 text-slate-900 hover:bg-slate-400"
					on:click={() => model.refresh_serial_list()}><Icon icon="refresh" /></button>
			</label>
		</div>
		<div class="flex">
			<label>
				Baud Rate:
				<select bind:value={state.connection.baudrate} class="border-1 select select-sm border-slate-200">
					{#each rates as r (r)}
						<option value={r} selected={state.connection.baudrate == r}>{r}</option>
					{/each}
				</select>
			</label>
		</div>
		<div class="form-control flex">
			<label for="reconnect">
				<input type="checkbox" id="reconnect" class="toggle" bind:checked={state.connection.autoconnect} />
				Connect Automatically</label>
		</div>
		<div class="form-control flex">
			<label for="reconnect">
				<input type="checkbox" id="reconnect" class="toggle" bind:checked={state.connection.rtscts} />
				Use Hardware Flow Control</label>
		</div>
	</div>
	<div slot="actions">
		<button
			class="btn-error btn-sm btn justify-end text-left"
			disabled={$active_port?.port == null}
			on:click={() => disconnect()}>
			Disconnect</button>
		<button
			class="btn-success btn-sm btn justify-end text-right"
			disabled={!state.connection.port}
			on:click={() => connect()}>Connect</button>
	</div>
</Modal>
