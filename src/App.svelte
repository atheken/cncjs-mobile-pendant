<script lang="ts">
	import { AppController, type ConnectionStatus } from './lib/AppController';
	import StandardControls from './lib/StandardControls.svelte';
	import JogControls from './lib/JogControls.svelte';
	import JobStatus from './lib/JobStatus.svelte';
	import { onMount } from 'svelte';
	import ConnectionPanel from './lib/ConnectionPanel.svelte';
	import Icon from './lib/Icon.svelte';
	import Status from './lib/Status.svelte';
	import DebugPanel from './lib/DebugPanel.svelte';
	import ErrorPage from './lib/ErrorPage.svelte';
	import type { Readable } from 'svelte/store';
	import Preferences from './lib/Preferences.svelte';
	import FullscreenNotice from './lib/FullscreenNotice.svelte';

	let controller: AppController;
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
			id: 'settings',
			alt: 'Settings',
			icon: 'gears'
		},
		{
			id: 'debug',
			alt: 'Debug',
			icon: 'bug'
		}
	];
	let selected_tab_id = 'commands';
	let error;

	let connection_status: Readable<ConnectionStatus>;

	onMount(async () => {
		try {
			controller = await AppController.Initialize();
			connection_status = controller.server_connection_status;
			active_port = controller.active_port;
		} catch (err) {
			error = err;
			console.error(err);
		}
	});
</script>

{#if error || $connection_status == 'error' || $connection_status == 'disconnected'}
	<ErrorPage {error} />
{:else if !controller}
	<FullscreenNotice motif="info">
		<div slot="icon"><Icon icon="spinner" class="animate-spin" /></div>
		<div slot="heading">Reticulating splines...</div>
		<div slot="content">
			Our elves are fast at work building all the widgets for this interface. We
			should be good to go in a moment!
		</div>
	</FullscreenNotice>
	<div class="text-center align-middle">Mobile Pendant is Loading</div>
{:else}
	<div class="flex h-screen flex-col overflow-hidden overscroll-none">
		<Status model={controller} />
		<ConnectionPanel model={controller} />
		<div class="grow overflow-scroll overscroll-contain">
			{#if selected_tab_id == 'commands'}
				<StandardControls model={controller} />
			{:else if selected_tab_id == 'job'}
				<JobStatus model={controller} />
			{:else if selected_tab_id == 'jog'}
				<JogControls model={controller} />
			{:else if selected_tab_id == 'settings'}
				<Preferences model={controller} />
			{:else if selected_tab_id == 'debug'}
				<DebugPanel model={controller} />
			{/if}
		</div>
		<!-- place the buttons for each of the above tabs in a dedicated div-->
		<div class="nav">
			{#each tabs as t (t.id)}
				<button
					on:click={() => (selected_tab_id = t.id)}
					class:active={t.id == selected_tab_id}
					class:bg-accent={t.id == selected_tab_id}
					><Icon icon={t.icon} />
				</button>
			{/each}
		</div>
	</div>
{/if}
