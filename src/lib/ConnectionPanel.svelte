<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	export let displayPanel = writable(false);
	let hasAutoconnected = false;
</script>

<script lang="ts">
	import Modal from './Modal.svelte';
	import type { AppController } from './AppController';

	import PendantState from './models/local/PendantState';
	import Toggle from './Toggle.svelte';
	export let model: AppController;

	let { ports, active_port } = model;

	let state = PendantState.instance;

	ports.subscribe((p) => {
		let port = state.connection?.port;
		if (
			state.connection.autoconnect &&
			p.find((f) => f.port == port) &&
			!hasAutoconnected
		) {
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

<Modal
	visible={$displayPanel}
	on:dismiss-requested={() => displayPanel.set(false)}>
	<span slot="heading">Connection Options</span>
	<div slot="content" class="mobile:ml-[20%] mobile:w-[60%]">
		<div class="m-2 grid w-full grid-cols-12 content-center gap-2">
			<div class="col-span-3 text-right text-sm">
				<span class="align-middle">Serial Port:</span>
			</div>
			<select
				class="col-span-7 rounded-sm border-gray-200 p-1 pr-12 text-sm shadow-sm"
				bind:value={state.connection.port}>
				{#each $ports as p (p.port)}
					<option value={p.port} selected={state.connection.port == p.port}
						>{p.port}</option>
				{/each}
			</select>
			<div class="col-span-2">
				<button class="btn btn-sm" on:click={() => model.refresh_serial_list()}>
					<span class="fa fa-refresh" /></button>
			</div>
			<div class="col-span-3 text-right align-middle text-sm">Baud Rate:</div>
			<select
				bind:value={state.connection.baudrate}
				class="col-span-7 rounded-sm border-gray-200 p-1 pr-12 text-sm shadow-sm">
				{#each rates as r (r)}
					<option value={r} selected={state.connection.baudrate == r}
						>{r}</option>
				{/each}
			</select>

			<div class="col-span-12 col-start-1 mobile:col-span-7 mobile:col-start-4">
				<Toggle
					label="Connect Automatically"
					bind:checked={state.connection.autoconnect} />
			</div>
			<div class="sm:col-span-7 sm:col-start-4 col-span-12 col-start-1">
				<Toggle
					label="Use Hardware Flow Control"
					bind:checked={state.connection.rtscts} />
			</div>
		</div>
	</div>
	<div slot="actions" class="grid mobile:ml-[20%] mobile:w-[60%]">
		<div class="flex justify-center space-x-1 p-2">
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
	</div>
</Modal>
