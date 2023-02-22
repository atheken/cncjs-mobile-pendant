<script>
	import StandardControls from './lib/StandardControls.svelte'
	import JogControls from './lib/JogControls.svelte'
	//import CoordinateDisplay from './CoordinateDisplay.svelte'
	import JobStatus from './lib/JobStatus.svelte'
	
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
</script>

<StandardControls/>
<hr/>
Status: { model.status || "Unknown" }	
<hr/>
<JogControls />
<hr>
<JobStatus model={model} />