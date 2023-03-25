<script lang="ts">
	import { AXES } from './models/api/Constants';
	import {
		ProbeCommands,
		type ProbeDefinition
	} from './models/local/MachinePreference';
	import Segment from './Segment.svelte';

	let allowedAxes = [AXES.X, AXES.Y, AXES.Z];
	export let probe: ProbeDefinition;
	probe.axis = probe.axis || AXES.Z;
</script>

<div class="grid grid-cols-12 items-center p-2">
	<span class="col-span-3 text-sm">Probe Axis:</span>
	<div class="col-span-9">
		<Segment
			elements={allowedAxes}
			labelFn={(a) => a}
			bind:element={probe.axis} />
	</div>
	<span class="col-span-3 text-sm">Probe Command:</span>
	<div class="col-span-9">
		<Segment
			elements={[
				ProbeCommands.G38_2,
				ProbeCommands.G38_3,
				ProbeCommands.G38_4,
				ProbeCommands.G38_5
			]}
			labelFn={(a) => a}
			bind:element={probe.command} />
	</div>
</div>
