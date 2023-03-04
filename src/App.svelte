<script lang="ts">
	import { Controller, SerialPort } from './lib/Controller';
	import StandardControls from './lib/StandardControls.svelte';
	import JogControls from './lib/JogControls.svelte';
	import JobStatus from './lib/JobStatus.svelte';
	import { onMount } from 'svelte';
	import ConnectionPanel from './lib/ConnectionPanel.svelte';
	import DisconnectControl from './lib/DisconnectControl.svelte';
	import Icon from './lib/Icon.svelte';
	import Status from './Status.svelte';
	import { blank_object } from 'svelte/internal';

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
			id: 'connection',
			alt: 'Connection Status',
			icon: 'bolt'
		},
		{
			id: 'jog',
			alt: 'Jog Machine',
			icon: 'gamepad'
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

<div class="container">
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
		<div class={!$active_port ? 'blur-sm' : ''}>
			{#if selected_tab_id == 'commands'}
				<StandardControls model={controller} />
			{:else if selected_tab_id == 'job'}
				<JobStatus model={controller} />
			{:else if selected_tab_id == 'jog'}
				<JogControls model={controller} />
			{:else if selected_tab_id == 'info'}
				Intentionally blank_object..
			{/if}
			<div class="btm-nav btm-nav-sm ">
				{#each tabs as t (t.id)}
					<button
						class="bg-primary"
						on:click={() => (selected_tab_id = t.id)}
						class:active={t.id == selected_tab_id}
						class:text-accent={t.id == selected_tab_id}
						data-tab-selection="t.id"
						><Icon icon={t.icon} />
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
</style>
