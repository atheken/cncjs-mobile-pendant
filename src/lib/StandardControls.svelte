<script lang="ts">
	import { onMount } from 'svelte';
	import type { Readable } from 'svelte/store';
	import type { CommandQueryResult, CommandRecord, Controller } from './Controller';
	import Divider from './Divider.svelte';
	import type MachineDeviceInterface from './MachineDeviceInterface';
	export let model: Controller;

	let primary_commands = [
		{ click: () => model.home(), name: 'Home', classes: ['btn-success'] },
		{ click: () => model.unlock(), name: 'Unlock' },
		{ click: () => model.sleep(), name: 'Sleep' },
		{ click: () => model.reset(), name: 'Reset' },
		{ click: () => model.feedhold(), name: 'Feedhold', classes: ['btn-error'] },
		{ click: () => model.cycle_start(), name: 'Cycle Start' }
	];
	let commands: Readable<CommandQueryResult> = model.commands;
	let mdi: Readable<MachineDeviceInterface[]> = model.mdi_commands;
</script>

<div>
	<Divider>Machine Control</Divider>
	<div class="grid grid-cols-3 justify-items-center">
		{#each primary_commands as p}
			<div class="w-full px-1 py-1 align-middle">
				<button class="btn-sm btn w-full align-middle {p.classes?.join(' ')}" on:click={p.click}> {p.name}</button>
			</div>
		{/each}
	</div>
	{#if $commands.records.length > 0}
		<Divider>Commands</Divider>
		<div class="grid grid-cols-1 justify-items-center">
			{#each $commands.records as c (c.id)}
				<div class="w-full px-1 py-1 align-middle">
					<button
						class="btn-outline btn-sm btn w-full align-middle"
						value={c.id}
						disabled={!c.enabled}
						on:click={() => model.execute_command(c)}>
						{c.title}</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
