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
    
	let controller:Controller;
	let active_port
	let tabs = [
		{
		id: "commands",
		alt: "Machine Device Interface",
		icon: commands
	},
	{
		id: "job",
		alt: "Job Control",
		icon: job
	}, {
		id: "connection",
		icon: connection
	},
	{
		id: "jog",
		icon: jog
	}]
	let selected_tab_id = "commands"
	let error;

	onMount(async () => {

		let model = {
			coords : {
				work : {
					x : 0.2 ,y: 1.1, z: 2.2
				},
				machine: {
					x : 0.1, y: 2.2, z: 3.1
				}
			},
			units: 'mm',
			jog_step: 1,
			loaded_file: 'process.nc',
			locked: false
		}


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
	Loading...
	{/if}
{:else}
<ConnectionPanel model={controller} />
	{#if selected_tab_id == 'commands'}
		<StandardControls model={controller} />
	{:else if selected_tab_id == 'job'}
		<JobStatus model={controller.workflow_state} />
	{:else if selected_tab_id == 'jog'}
		<JogControls />
	{:else if selected_tab_id == 'connection'}
		<div>
			<button class="btn btn-error" disabled={!$active_port} on:click={()=> controller.close_connection()}>Disconnect</button>
		</div>
	{/if}
	<div class="btm-nav btm-nav-sm">
		{#each tabs as t(t.id)}
			<button on:click={()=> selected_tab_id = t.id } class:active={t.id == selected_tab_id} data-tab-selection={t.id}>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><image width="24" height="24" xlink:href="{t.icon}"></image></svg></button>
		{/each}
	</div>
{/if}
</div>
