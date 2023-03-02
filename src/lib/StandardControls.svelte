
<script lang="ts">
    import { onMount } from "svelte";
    import type { Readable } from "svelte/store";
    import type { CommandQueryResult, CommandRecord, Controller } from "./Controller";
    import type MachineDeviceInterface from "./MachineDeviceInterface";
    export let model:Controller;

	let primary_commands = [
		{click : model.home, name: "Home", classes:["btn-success"]},
		{click : model.unlock, name: "Unlock"},
		{click : model.sleep, name: "Sleep"},
		{click : model.reset, name: "Reset"},
		{click : model.feedhold, name: "Feedhold", classes:["btn-error"]},
		{click : model.cycle_start, name: "Cycle Start"},
	]
	let commands:Readable<CommandQueryResult> = model.commands;
	let mdi: Readable<MachineDeviceInterface[]> = model.mdi_commands;
	
</script>
<div>
	<div class="divider text-xs text-info">Machine State:</div>
	<div class="grid justify-items-center grid-cols-3">
		{#each primary_commands as p}
			<div class="w-full px-1 py-1 align-middle">
				<button class="align-middle btn btn-sm w-full {p.classes?.join(' ')}" on:click={()=> p.click() }>{p.name}</button>
			</div>
		{/each}
	</div>
	{#if $commands.records.length > 0}
	<div class="divider text-xs text-info">Commands:</div>
	<div class="grid justify-items-center grid-cols-1">
		{#each $commands.records as c(c.id)}
			<div class="w-full px-1 py-1 align-middle"><button class="btn-outline align-middle btn btn-sm w-full" value="{c.id}" disabled="{!c.enabled}" on:click={()=> model.execute_command(c) }> {c.title}</button></div>
		{/each}
	</div>
	{/if}
	{#if $mdi.length > 0 }
	<div class="divider text-xs text-info">Machine Device Interface:</div>
	<div class="grid justify-items-center grid-cols-3">
		{#each $mdi as m(m.id)}
			<div class="w-full px-1 py-1 align-middle"><button class="align-middle btn btn-sm w-full" value="{m.id}" on:click={()=> model.execute_mdi(m) } >{m.name}</button></div>
		{/each}
	</div>
	{/if}
</div>