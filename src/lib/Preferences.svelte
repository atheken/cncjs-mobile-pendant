<script lang="ts">
	import { derived, get, writable } from 'svelte/store';
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import FullscreenNotice from './FullscreenNotice.svelte';
	import Modal from './Modal.svelte';
	import type MachineDefinition from './models/api/MachineDefinition';
	import {
		ProbeCommands,
		type ProbeDefinition
	} from './models/local/MachinePreference';

	import ProbeOptions from './ProbeOptions.svelte';
	import { AXES, ControllerType } from './models/api/Constants';
	import type MachinePreference from './models/local/MachinePreference';
	import Segment from './Segment.svelte';

	export let model: AppController;

	let machines = derived(model.machines, (f) => f.records);
	let machine: MachineDefinition = null;
	let machine_prefs: Partial<MachinePreference> = {};

	machines.subscribe((f) => (machine ||= f[0]));

	// let machine_prefs = writable<Partial<MachinePreference>>({});

	// derived([model.pendant_prefs, machine], (e) =>
	// 	machine_prefs.set(e[0].machine_preferences?.find((k) => k.id == e[1]?.id))
	// );

	// function save_prefs(){
	// 	let prefs = get(model.pendant_prefs) || {};
	// 	let mpref = get(machine_prefs);

	// 	prefs.machine_preferences ||= [];
	// 	if(mpref.id){
	// 		prefs.machine_preferences = [
	// 			...prefs.machine_preferences.filter((k) => k.id == mpref.id),
	// 			mpref
	// 		];
	// 	}
	// 	model.save_pendant_prefs(prefs);
	// }

	let activeprobe: Partial<ProbeDefinition> = {};
	let editingprobe = false;
	let probe_edit_mode: 'Add' | 'Edit' = 'Add';
	function editprobe(
		probe: Partial<ProbeDefinition> = {},
		mode: 'Add' | 'Edit' = 'Add'
	) {
		probe.command ||= ProbeCommands.G38_2;
		probe.axis ||= AXES.Z;
		probe.depth ||= 100;
		probe.retraction ||= 10;
		probe.feedrate ||= 100;
		probe.touchplate_thickness ||= 15;
		probe.execute_probe_on_tool_change = true;

		probe_edit_mode = mode;
		activeprobe = probe;
		editingprobe = true;
	}

	function saveProbe() {
		editingprobe = false;
		activeprobe = {};
		machine_prefs.probes ||= [];
	}
</script>

{#if $machines.length > 0}
	<div class="fit-center">
		<div class="col-span-12 text-xs">Select a machine:</div>
		<select class="select col-span-12" bind:value={machine}>
			{#each $machines as m (m.id)}
				<option value={m}>{m.name}</option>
			{/each}
		</select>
		{#if machine != null}
			<div class="col-span-12">
				<Divider>Machine Preferences</Divider>
				<div class="text-xs">Machine Type:</div>
				<Segment
					class="text-xs"
					bind:element={machine_prefs.type}
					elements={[
						ControllerType.GRBL,
						ControllerType.MARLIN,
						ControllerType.SMOOTHIE,
						ControllerType.TINYG
					]}
					labelFn={(c) => c} />
			</div>
			<div class="col-span-12 grid gap-2">
				<Divider>Probes</Divider>
				{#if machine_prefs?.probes?.length > 0}
					{#each machine_prefs?.probes as p}
						{JSON.stringify(p)}
					{/each}
				{:else}
					<div class="text-center text-xs">
						No probes have been configured for this machine.
					</div>
				{/if}
				<div class="text-right">
					<button class="btn btn-xs" on:click={() => editprobe()}
						><span class="fa fa-plus" />Add Probe</button>
				</div>
			</div>
		{/if}
	</div>
	<Modal
		visible={editingprobe}
		on:dismiss-requested={() => (editingprobe = false)}
		class="">
		<div slot="heading">
			{probe_edit_mode} Probe Definition
		</div>
		<ProbeOptions slot="content" bind:probe={activeprobe} {saveProbe} />
	</Modal>
{:else}
	<FullscreenNotice motif="warn">
		<span slot="icon" class="fa fa-exclamation-triangle" />
		<p slot="heading">No machines currently configured.</p>
		<p slot="content">
			Use the main Cnc.js interface to define machines and then return to this
			interface to configure preferences for the mobile pendant.
		</p>
	</FullscreenNotice>
{/if}
