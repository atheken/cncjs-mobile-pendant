<script>
	import { CommandQueryResult, CommandRecord, Controller } from './lib/Controller';

	import StandardControls from './lib/StandardControls.svelte'
	import JogControls from './lib/JogControls.svelte'
	//import CoordinateDisplay from './CoordinateDisplay.svelte'
	import JobStatus from './lib/JobStatus.svelte'
    import { onMount } from 'svelte';

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
		status : 'busy',
		loaded_file: 'process.nc',
		locked: false
	}

	let c = new Controller();

	let commands = [];
	let serialports = [];

	onMount(async ()=> {
		let records = (await c.commands()).records;
		console.info(records);
		commands = records;
		serialports = await c.ports
	});
</script>


<StandardControls/>
<hr/>
Status: { model.status || "Unknown" }	
<hr/>
<JogControls />
<hr>
<JobStatus model={model} />

<hr />

{#each commands as c(c.id) }
	<button id={c.id} disabled={!c.enabled }>{c.title}</button>
{/each}