<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Controller } from './lib/Controller';

	export let model: Controller;
	let active_port = model.active_port;
</script>

{#if $active_port?.port != null}
	<div class="w-full bg-green-100 p-1 text-center align-middle text-sm">
		<span class="fa fa-bolt" />
		<span class="text-xs">Connected to:</span>
		<span class="link font-mono">{$active_port?.port}</span>
	</div>
{:else}
	<div class="fg-rose-900 bg-red-100 text-sm">Not Connected</div>
{/if}
