<style></style>

<script lang="ts">
	import { Controller } from './lib/Controller';
	import StandardControls from './lib/StandardControls.svelte'
	import JogControls from './lib/JogControls.svelte'
	import JobStatus from './lib/JobStatus.svelte'
	import { onMount } from 'svelte';
	import ConnectionPanel from './lib/ConnectionPanel.svelte';

	let controller:Controller;

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

		controller = await Controller.Initialize();
	});

</script>

{#if !controller}
	Loading...
{:else}
	<StandardControls model={controller} />
	<hr/>

	<JogControls />
	<hr>
	<JobStatus model={controller.workflow_state} />
	<ConnectionPanel model={controller}/>
{/if}

