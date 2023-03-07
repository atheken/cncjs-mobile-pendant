<script lang="ts">
	import type { Controller } from './lib/Controller';
	import Divider from './lib/Divider.svelte';

	export let model: Controller;
</script>

<div>
	<Divider>Debug</Divider>
	<button class="btn-sm btn" on:click={() => model.cncjs_command('statusreport')}>Status report</button>
	<button class="btn-sm btn" on:click={() => model.cncjs_command('probe')}>probe</button>
</div>
