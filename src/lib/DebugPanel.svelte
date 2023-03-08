<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';

	export let model: AppController;

	let controllers = model.controllers;
</script>

<div>
	<Divider>Debug</Divider>
	<div class="flex flex-row place-content-center space-x-1">
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('statusreport')}>Status report</button>
		<button class="btn btn-sm basis-[45%]" on:click={() => model.cncjs_command('probe')}>probe</button>
	</div>
	<Divider>Controllers:</Divider>
	<pre>{JSON.stringify($controllers, null, ' ')}</pre>
</div>
