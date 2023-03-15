<script lang="ts">
	import type { AppController } from './AppController';
	import Divider from './Divider.svelte';
	import Macros from './Macros.svelte';

	export let model: AppController;
	let controller = model.controller;
</script>

<div>
	<Divider
		><span
			class="after:content-['xs'] sm:after:content-['sm'] md:after:content-['md']"
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
