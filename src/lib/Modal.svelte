<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let visible = false;
	export let blockaccess = true;
	let classes = '';
	export { classes as class };

	let dispatcher = createEventDispatcher();
	function requestDismiss() {
		dispatcher('dismiss-requested');
	}
</script>

<div class={classes}>
	<div
		class="fixed inset-0 z-40 h-full w-full"
		class:backdrop-blur-sm={blockaccess}
		class:hidden={!visible || !blockaccess}
		on:keyup={requestDismiss}
		on:click={requestDismiss} />
	<div
		class="mdl fixed inset-x-0 bottom-0 z-50 w-full bg-white"
		class:mdl-visible={visible}>
		<slot name="heading" />
		<slot name="content" />
		<slot name="actions" />
	</div>
</div>
