<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import { SpindleOptions } from './models/api/MachinePreference';
	import type MachinePreference from './models/api/MachinePreference';
	export let controller: AppController;

	export let current_machine: MachinePreference;

	let speed = 1000;

	function apply_speed_change() {
		controller.write(`S${speed}`);
	}

	function apply_machine_control() {
		let el = this as HTMLButtonElement;
		controller.write(el.value);
	}
</script>

{#if current_machine?.spindle_options?.length > 0}
	<Divider>Spindle Control</Divider>
	{#each current_machine.spindle_options as opt}
		<button value={opt} on:click={apply_machine_control}>{opt}</button>
	{/each}
{/if}
<label>
    <span class="text-sm">Spindle Speed:</span>
	<input
		type="number"
		bind:value={speed}
		on:change={() => {
			apply_speed_change();
		}} />
	<button>Apply</button>
</label>
