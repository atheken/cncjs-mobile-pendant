<script lang="ts">
	import { derived } from 'svelte/store';
	import type { AppController } from './AppController';

	export let model: AppController;
	let macros = derived(model.macros, (f) => f.records);
</script>

<div class="m-2 grid grid-cols-1">
	{#each $macros as m (m.id)}
		<div>
			<button
				class="btn mr-1 inline-block px-2"
				on:click={() => {
					model.execute_macro(m);
				}}><span class="fa fa-play" /></button
			>{m.name}
		</div>
	{/each}
</div>
