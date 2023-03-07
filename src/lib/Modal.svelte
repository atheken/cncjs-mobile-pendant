<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let visible = false;
	export let blockaccess = true;

	let dispatcher = createEventDispatcher();
	function requestDismiss() {
		dispatcher('dismiss-requested');
	}
</script>

<div>
	<div
		class="fixed inset-0 z-40 h-full w-full"
		class:backdrop-blur-sm={blockaccess}
		class:hidden={!visible || !blockaccess}
		on:keyup={requestDismiss}
		on:click={requestDismiss} />
	<div
		class="mdl fixed inset-x-0 bottom-0 z-50 max-h-[75%]
		w-full border-y-2 border-gray-200 bg-white"
		class:mdl-visible={visible}>
		<div class="text-md w-full bg-gray-200 p-2 text-center">
			<slot name="heading" />
		</div>
		<div class="p-2">
			<slot name="content" />
		</div>
	</div>
</div>
