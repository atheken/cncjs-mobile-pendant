<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { CommandQueryResult, CommandRecord, Controller } from './Controller';
	import Divider from './Divider.svelte';
	import Icon from './Icon.svelte';
	export let model: Controller;

	let primary_commands = [
		{
			click: () => model.home(),
			name: 'Home',
			classes: ['bg-purple-400 border-purple-500'],
			icon: 'home'
		},
		{
			click: () => model.unlock(),
			name: 'Unlock',
			classes: ['bg-cyan-400 border-cyan-500'],
			icon: 'unlock'
		},
		{
			click: () => model.sleep(),
			name: 'Sleep',
			classes: ['bg-blue-400 border-blue-500'],
			icon: 'bed'
		},
		{
			click: () => model.reset(),
			name: 'Reset',
			classes: ['bg-orange-400 border-orange-500'],
			icon: 'repeat'
		},

		{
			click: () => model.cycle_start(),
			classes: ['grow bg-green-400 border-green-500 col-span-2'],
			name: 'Cycle Start',
			icon: 'circle-play',
			width: 2,
			square: true
		},
		{
			click: () => model.feedhold(),
			name: 'Feedhold',
			classes: ['bg-rose-400 border-rose-800 text-rose-900 col-span-2'],
			icon: 'circle-stop',
			width: 2,
			square: true
		}
	];
	let commands: Readable<CommandQueryResult> = model.commands;
</script>

<div>
	<Divider>Machine Control</Divider>
	<div class="grid grid-cols-4 justify-items-center">
		{#each primary_commands as p}
			<div class="h-full w-full px-1 py-1 align-middle col-span-{p.width || 1}" class:aspect-video={p.square}>
				<button class="btn-sm btn h-full w-full align-middle {p.classes?.join(' ')}" on:click={p.click}
					><Icon icon={p.icon} />&nbsp;{p.name}</button>
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
