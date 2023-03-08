<script lang="ts">
	import type { Controller } from './Controller';
	import Divider from './Divider.svelte';

	export let model: Controller;
</script>

<div>
	<Divider>Debug</Divider>
	<div class="flex flex-row place-content-center space-x-1">
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('statusreport')}>Status report</button>
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('probe')}>probe</button>
	</div>
	<Divider>CNC.js State:</Divider>
	{#await model.get_state('') then state}
		<pre>{JSON.stringify(state, null, ' ')}</pre>
	{/await}
</div>
