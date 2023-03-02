<style>
</style>

<script lang="ts">
	import job from './assets/icons/job.svg';
	import connection from './assets/icons/connection.svg';
	import jog from './assets/icons/jog.svg';
	import commands from './assets/icons/commands.svg';

	import { Controller, SerialPort } from './lib/Controller';
	import StandardControls from './lib/StandardControls.svelte'
	import JogControls from './lib/JogControls.svelte'
	import JobStatus from './lib/JobStatus.svelte'
	import { onMount } from 'svelte';
	import ConnectionPanel from './lib/ConnectionPanel.svelte';
    import DisconnectControl from './lib/DisconnectControl.svelte';
    
	let controller:Controller;
	let active_port
	let tabs = [
		{
		id: "commands",
		alt: "Session Commands",
		icon: commands
	},
	{
		id: "job",
		alt: "Job Control",
		icon: job
	}, {
		id: "connection",
		alt: "Connection Status",
		icon: connection
	},
	{
		id: "jog",
		alt: "Jog Machine",
		icon: jog
	}]
	let selected_tab_id = "commands"
	let error;

	onMount(async () => {

		try{
			controller = await Controller.Initialize();
			active_port = controller.active_port;
		}
		catch(err){
			error = err
		}
	});

</script>
<div class="container mx-auto">
{#if !controller}
	{#if error}
	The following error: {error}
	{:else}
		<div class="text-center align-middle">Mobile Pendant is Loading</div>
	{/if}
{:else}
		<ConnectionPanel model={controller} />
		<div class={!$active_port ? 'blur-sm' : ''} >
		{#if selected_tab_id == 'commands'}
			<StandardControls model={controller} />
		{:else if selected_tab_id == 'job'}
			<JobStatus model={controller} />
		{:else if selected_tab_id == 'jog'}
			<JogControls />
		{:else if selected_tab_id == 'connection'}
			<DisconnectControl model={controller} />
		{/if}
		<div class="btm-nav btm-nav-sm ">
			{#each tabs as t(t.id)}
				<button class="bg-primary" on:click={()=> selected_tab_id = t.id } class:active={t.id == selected_tab_id} class:text-accent={t.id == selected_tab_id}
					data-tab-selection={t.id}><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><image width="24" height="24"
						 xlink:href="{t.icon}"></image></svg>
				</button>
			{/each}
		</div>
	</div>
{/if}
</div>
