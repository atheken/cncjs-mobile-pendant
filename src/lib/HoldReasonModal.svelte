<script lang="ts">
	import type { AppController } from './AppController';
	import Modal from './Modal.svelte';

	export let model: AppController;
	let controller = model.controller;
</script>

<Modal visible={$controller?.sender?.hold || false} blockaccess={false}>
	<div slot="heading">Job on Hold</div>
	<div slot="content">
		{#if $controller.sender?.holdReason && !$controller.sender.holdReason.err}
			{#if $controller.sender.holdReason?.data == 'M6'}
				<div class="text-md">Tool change required `{$controller.sender?.holdReason?.msg}`.</div>
				<div class="text-sm">
					The program has requested a tool change, when you are finished, you may run a probe before continuing with the
					gcode program.
				</div>
			{:else}
				<div class="text-md">
					The program has paused for the following reason: {$controller.sender?.holdReason?.msg}.
				</div>
			{/if}
		{:else if $controller.sender?.holdReason?.err}
			<div class="text-error">The job is on hold due to the following error:</div>
			<div class="text-monospace">{$controller.sender.holdReason.msg}</div>
		{:else}
			<div class="text-center">Job has been manually paused.</div>
		{/if}
	</div>
	<div slot="actions">
		{#if $controller?.sender?.holdReason?.data == 'M6'}
			<button
				class="btn btn-sm"
				on:click={() => {
					console.log('z-probe requested.');
				}}>Z-Probe</button>
		{/if}
		<button class="btn btn-sm border-none bg-green-600 text-white" on:click={() => model.start_or_resume_gcode()}
			><span class="fa fa-play" />&nbsp;Continue</button>
	</div>
</Modal>
