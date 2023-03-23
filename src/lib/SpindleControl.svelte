<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import type MachinePreference from './models/local/MachinePreference';
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
		<button class="btn btn-sm" value={opt} on:click={apply_machine_control}
			>{opt}</button>
	{/each}
{/if}
<Divider>Spindle Control</Divider>
<label class="flex w-full items-center gap-1 p-1 text-right">
	<span class="text-xs">Speed:</span>
	<input
		class="input grow"
		type="number"
		bind:value={speed}
		on:change={() => {
			apply_speed_change();
		}} />
	<button class="btn btn-sm text-xs">Apply</button>
</label>
