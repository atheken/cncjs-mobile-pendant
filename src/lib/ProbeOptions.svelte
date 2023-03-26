<script lang="ts">
	import { AXES } from './models/api/Constants';
	import {
		ProbeCommands,
		type ProbeDefinition
	} from './models/local/MachinePreference';

	import Segment from './Segment.svelte';
	import Toggle from './Toggle.svelte';

	export let probe: Partial<ProbeDefinition>;

	let allowedAxes = [AXES.X, AXES.Y, AXES.Z];

	let pattern = '[0-9]+(.[0-9]+)?';
	export let isValid = false;
	export let saveProbe: () => void;
	const commandDescriptions: Record<ProbeCommands, string> = {
		[ProbeCommands.G38_2]:
			'Probe toward workpiece, stop on contact, signal error if failure.',
		[ProbeCommands.G38_3]: 'Probe toward workpiece, stop on contact.',
		[ProbeCommands.G38_4]: 'Probe away from workpiece, stop on loss of contact, signal error if failure.',
		[ProbeCommands.G38_5]: 'Probe away from workpiece, stop on loss of contact.'
	};
</script>

<form
	on:submit|preventDefault={() => {}}
	on:change={(el) => {
		isValid = el.currentTarget.reportValidity();
	}}>
	<div class="grid grid-cols-12 items-center gap-2 overflow-scroll p-2">
		<span class="col-span-4 text-right text-sm">Axis:</span>
		<div class="col-span-8">
			<Segment
				class="space-2"
				elements={allowedAxes}
				labelFn={(a) => a}
				bind:element={probe.axis} />
		</div>
		<span class="col-span-4 text-right text-sm">Command:</span>
		<div class="col-span-8">
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
		<span class="col-span-8 col-start-5 text-xs italic text-neutral-500"
			>{commandDescriptions[probe.command]}</span>
		<span class="col-span-4 text-right text-sm">Touch plate thickness:</span>
		<input
			{pattern}
			class="input col-span-8 invalid:border-red-300"
			required
			type="number"
			step="any"
			inputmode="decimal"
			bind:value={probe.touchplate_thickness} />
		<span class="col-span-4 text-right text-sm">Retraction:</span>
		<input
			{pattern}
			class="input col-span-8 invalid:border-red-300"
			type="number"
			step="any"
			inputmode="decimal"
			required
			bind:value={probe.retraction} />
		<span class="col-span-4 text-right text-sm">Max depth:</span>
		<input
			{pattern}
			class="input col-span-8 invalid:border-red-300"
			type="number"
			inputmode="decimal"
			step="any"
			required
			bind:value={probe.depth} />

		<span class="col-span-4 text-right text-sm">Feedrate:</span>
		<input
			{pattern}
			class="input col-span-8 invalid:border-red-300"
			type="number"
			step="any"
			inputmode="decimal"
			required
			bind:value={probe.feedrate} />

		<div class="col-span-12">
			<Toggle
				label="Apply Tool Length Offset"
				bind:checked={probe.apply_tool_offset} />
		</div>
		<div class="col-span-12">
			<Toggle
				label="Require on Tool Change"
				bind:checked={probe.execute_probe_on_tool_change} />
		</div>
	</div>
	<div class="flex place-content-end p-2">
		<button class="btn btn-sm" disabled={!isValid} on:click={() => saveProbe()}
			>Save</button>
	</div>
</form>
