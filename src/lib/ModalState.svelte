<script lang="ts">
	import type { AppController } from './AppController';
	let model: AppController;
	let controller = model.controller;
</script>

{#if $controller}
	Sender State:
	<pre class="code text-xs">{JSON.stringify($controller.sender, null, 2)}</pre>
	Feeder State:
	<pre class="code text-xs">{JSON.stringify($controller.feeder, null, 2)}</pre>
{/if}
