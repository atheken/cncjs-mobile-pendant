
<script lang="ts">
    import { onMount } from "svelte";
    import type { CommandRecord, Controller } from "./Controller";
    import type MachineDeviceInterface from "./MachineDeviceInterface";
    export let model:Controller;

	let commands:CommandRecord[] = [];
	let mdi: MachineDeviceInterface[] = [];

	onMount(async ()=> {
		commands = (await model.commands()).records;
		mdi = (await model.mdi_commands());
	});

</script>
<div>
<button class="btn btn-success" on:click={()=> model.home() }>
	Home
</button>
<button class="btn bg-red-500 border-red-600 text-rose-200" on:click={ ()=> model.feedhold() }>
	Feedhold
</button>
<button class=btn on:click={ ()=> model.unlock() }>
	Unlock
</button>
<button class=btn on:click={() => model.cycle_start() } >
	Continue
</button>
<button class=btn on:click={() => model.reset() } >
	Reset
</button>
<hr/>
{#each commands as c(c.id)}
	<button class=btn value="{c.id}" disabled="{!c.enabled}" on:click={()=> model.execute_command(c) }> {c.title}</button>
{/each}
<hr/>
{#each mdi as m(m.id)}
	<button class=btn value="{m.id}" on:click={()=> model.execute_mdi(m) } >{m.name}</button>
{/each}
</div>