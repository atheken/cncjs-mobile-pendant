<script lang="ts">
	import type { AppController } from './AppController';
	import { displayPanel } from './ConnectionPanel.svelte';
	import { derived } from 'svelte/store';

	export let model: AppController;

	let statuses = {
		error: { icon: 'fire animate-pulse', label: 'Error connecting to:' },
		connected: { icon: 'bolt animate-pulse', label: 'Connected to:' },
		disconnected: { icon: 'handshake-slash', label: 'Not Connected:' },
		pending: { icon: 'arrow-rotate-right animate-spin', label: 'Connecting to:' }
	};

	let status = derived([model.active_port, model.serial_connection_status], ([p, s]) => {
		return {
			port: p?.port,
			status: s,
			icon: statuses[s].icon,
			label: statuses[s].label
		};
	});
</script>

<div class="status w-full p-1 text-center align-middle text-sm port-status-{$status.status}">
	<span class="fa fa-{$status.icon}" />&nbsp; {$status.label}
	<button
		class="link font-mono"
		on:click={() => {
			displayPanel.set(true);
		}}>{$status.port || 'Connect...'}</button>
</div>
