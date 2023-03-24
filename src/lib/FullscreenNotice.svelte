<script>
	export let motif = 'warn';
</script>

<div class="grid h-full w-full items-center notice-{motif} overscroll-none">
	<div class="notice-body grid gap-4 text-center text-xs">
		<slot name="icon" />
		<slot name="heading" />
		<slot name="content" />
	</div>
</div>
