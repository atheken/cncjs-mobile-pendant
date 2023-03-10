<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';

	export let model: AppController;
	let controller = model.controller;
</script>

<div>
	<Divider>Debug</Divider>
	<div class="flex flex-row place-content-center space-x-1">
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('statusreport')}>Status report</button>
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('probe')}>probe</button>
	</div>
	{#key $controller}
		<Divider>Controller:</Divider>
		<div class="text-center text-xs text-slate-700">Updated: {new Date()}</div>
		<pre>{JSON.stringify($controller, null, ' ')}</pre>
	{/key}
</div>
