<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	export let displayPanel = writable(false);
	let hasAutoconnected = false;
</script>

<script lang="ts">
	import Modal from './Modal.svelte';
	import type { AppController } from './AppController';

	import PendantState from './models/local/PendantState';
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
	<div slot="content" class="sm:ml-[30%] sm:w-[40%]">
		<div class="flex flex-col gap-1 p-2">
			<label>
				<span class="text-sm">Serial Port:</span>
				<select
					class="rounded-sm border-gray-200 p-1 pr-12 text-sm shadow-sm"
					bind:value={state.connection.port}>
					{#each $ports as p (p.port)}
						<option value={p.port} selected={state.connection.port == p.port}
							>{p.port}</option>
					{/each}
				</select>
				<button class="btn btn-sm" on:click={() => model.refresh_serial_list()}>
					<span class="fa fa-refresh" /></button>
			</label>
			<label>
				<span class="text-sm">Baud Rate:</span>
				<select
					bind:value={state.connection.baudrate}
					class="rounded-sm border-gray-200 p-1 pr-12 text-sm shadow-sm">
					{#each rates as r (r)}
						<option value={r} selected={state.connection.baudrate == r}
							>{r}</option>
					{/each}
				</select>
			</label>
			<label>
				<input
					type="checkbox"
					id="reconnect"
					class="toggle"
					bind:checked={state.connection.autoconnect} />
				Connect Automatically
			</label>
			<label>
				<input
					type="checkbox"
					id="reconnect"
					class="toggle"
					bind:checked={state.connection.rtscts} />
				Use Hardware Flow Control
			</label>
		</div>
	</div>
	<div slot="actions" class="grid sm:ml-[30%] sm:w-[40%]">
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
