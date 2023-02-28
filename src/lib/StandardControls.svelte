
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
<button>
	Home
</button>
<button>
	E-STOP
</button>
<button>
	Lock
</button>
<button>
	Reset
</button>
<hr/>
{#each commands as c(c.id)}
	<button value="{c.id}" disabled="{!c.enabled}">{c.title}</button>
{/each}
<hr/>
{#each mdi as m(m.id)}
	<button value="{m.id}">{m.name}</button>
{/each}
</div>