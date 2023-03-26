<script lang="ts">
	import { derived } from 'svelte/store';
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import FullscreenNotice from './FullscreenNotice.svelte';
	import Modal from './Modal.svelte';
	import type MachineDefinition from './models/api/MachineDefinition';
	import {
		ProbeCommands,
		type ProbeDefinition
	} from './models/local/MachinePreference';
	import type MachinePreference from './models/local/MachinePreference';
	import ProbeOptions from './ProbeOptions.svelte';
	import { AXES } from './models/api/Constants';

	export let model: AppController;

	let prefs = model.pendant_prefs;

	let machine: MachineDefinition = null;

	function pref_or_default(machine_id: string): Partial<MachinePreference> {
		return null;
	}

	let machines = derived(model.machines, (f) => f.records);
	machines.subscribe((f) => (machine ||= f[0]));

	let activeprobe: Partial<ProbeDefinition> = {};
	let editingprobe = false;
	let probe_edit_mode: 'Add' | 'Edit' = 'Add';
	function editprobe(
		probe: Partial<ProbeDefinition> = {},
		mode: 'Add' | 'Edit' = 'Add'
	) {
		probe.command ||= ProbeCommands.G38_2;
		probe.axis ||= AXES.Z;

		probe_edit_mode = mode;
		activeprobe = probe;
		editingprobe = true;
	}

	function saveProbe() {
		editingprobe = false;
		activeprobe = {};
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
		<div class="col-span-12">
			{#if machine != null}
				<Divider>Machine Preferences</Divider>
				<Divider>Probes</Divider>
				<button class="btn btn-sm" on:click={() => editprobe()}
					><span class="fa fa-plus" />Add Probe...</button>
			{/if}
		</div>
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
