<script lang="ts">
	import { Controller } from './lib/Controller';
	import StandardControls from './lib/StandardControls.svelte';
	import JogControls from './lib/JogControls.svelte';
	import JobStatus from './lib/JobStatus.svelte';
	import { onMount } from 'svelte';
	import ConnectionPanel from './lib/ConnectionPanel.svelte';
	import Icon from './lib/Icon.svelte';
	import Status from './Status.svelte';
	import DebugPanel from './DebugPanel.svelte';

	let controller: Controller;
	let active_port;
	let tabs = [
		{
			id: 'commands',
			alt: 'Session Commands',
			icon: 'terminal'
		},
		{
			id: 'job',
			alt: 'Job Control',
			icon: 'play'
		},
		{
			id: 'jog',
			alt: 'Jog Machine',
			icon: 'gamepad'
		},
		{
			id: 'debug',
			alt: 'Debug',
			icon: 'bug'
		}
	];
	let selected_tab_id = 'commands';
	let error;

	onMount(async () => {
		try {
			controller = await Controller.Initialize();
			active_port = controller.active_port;
		} catch (err) {
			error = err;
			console.error(err);
		}
	});
</script>

<div class="overflow-auto overscroll-none">
	{#if error}
		<div class="flex h-full items-center justify-center">
			<div class="text-center align-middle text-sm text-rose-900">
				<Icon icon="warn" class="text-5xl text-rose-900" />
				<div class="text-xl">Well, this is embarrasing.</div>
				<div class="p-4 text-justify text-neutral-500">
					The app is currently unavailable. You may need to restart Cnc.js and reload this app to fix the problem.
				</div>
				<button class="link" on:click={() => window.location.reload()}>Try Again...</button>
			</div>
		</div>
	{:else if !controller}
		<div class="text-center align-middle">Mobile Pendant is Loading</div>
	{:else}
		<Status model={controller} />
		<ConnectionPanel model={controller} />
		<div>
			{#if selected_tab_id == 'commands'}
				<StandardControls model={controller} />
			{:else if selected_tab_id == 'job'}
				<JobStatus model={controller} />
			{:else if selected_tab_id == 'jog'}
				<JogControls model={controller} />
			{:else if selected_tab_id == 'debug'}
				<DebugPanel model={controller} />
			{/if}
			<div class="btm-nav btm-nav-sm border-t-[1px] border-accent bg-slate-100">
				{#each tabs as t (t.id)}
					<button
						on:click={() => (selected_tab_id = t.id)}
						class:active={t.id == selected_tab_id}
						class:bg-accent={t.id == selected_tab_id}
						class="border-0 text-slate-500"
						data-tab-selection="t.id"
						><Icon icon={t.icon} />
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
