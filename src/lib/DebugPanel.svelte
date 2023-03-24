<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import Macros from './Macros.svelte';

	import Home from 'fa-solid/house.svg';

	export let model: AppController;
	let controller = model.controller;
</script>

<div>
	<span class="inline-block aspect-square h-5"><Home /></span>

	<Divider
		><span
			class="sm:after:content-['sm'] md:after:content-['md'] after:content-['xs']"
			>Size&nbsp;
		</span></Divider>

	<Divider>Debug</Divider>
	<div class="flex flex-row place-content-center space-x-1">
		<button
			class="btn-sm btn basis-[45%]"
			on:click={() => model.cncjs_command('statusreport')}
			>Status report</button>
		<button
			class="btn-sm btn basis-[45%]"
			on:click={() => model.cncjs_command('probe')}>probe</button>
	</div>
	<Divider>Macros:</Divider>
	<Macros {model} />
	{#key $controller}
		<Divider>Controller:</Divider>
		<div class="text-center text-xs text-slate-700">Updated: {new Date()}</div>
		<pre>{JSON.stringify($controller, null, ' ')}</pre>
	{/key}
</div>
