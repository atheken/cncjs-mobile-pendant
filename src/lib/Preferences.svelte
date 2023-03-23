<script lang="ts">
	import { onMount } from 'svelte';
	import { derived } from 'svelte/store';
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import FullscreenNotice from './FullscreenNotice.svelte';
	import type MachineDefinition from './models/api/MachineDefinition';
	import type MachinePreference from './models/local/MachinePreference';

	export let model: AppController;

	let prefs = model.pendant_prefs;

	let machine: MachineDefinition = null;

	function pref_or_default(machine_id: string): MachinePreference {
		return null;
	}

	let machines = derived(model.machines, (f) => f.records);
	machines.subscribe((f) => (machine ||= f[0]));
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
				<button class="btn btn-sm"
					><span class="fa fa-plus" /> Add Probe...</button>
			{/if}
		</div>
	</div>
{:else}
	<FullscreenNotice motif="warn">
		<span slot="icon" class="fa fa-exclamation-triangle" />
		<p slot="heading">No machines currently configured.</p>
		<p slot="content">
			Use the main Cncjs interface to define machines and then return to this
			interface to configure machine preferences for the mobile pendant.
		</p>
	</FullscreenNotice>
{/if}
