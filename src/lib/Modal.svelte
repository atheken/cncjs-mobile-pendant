<script lang="ts">
	export let visible = false;
</script>

<div class="absolute inset-0 z-50 h-full w-full backdrop-blur-sm" class:hidden={!visible}>
	<div class="absolute inset-x-0 bottom-0 w-full border-y-2 border-gray-200 bg-white">
		<div class="w-full bg-gray-200 p-1 text-left text-sm">
			<slot name="heading" />
		</div>
		<div class="p-2">
			<slot name="content" />
		</div>
	</div>
</div>
