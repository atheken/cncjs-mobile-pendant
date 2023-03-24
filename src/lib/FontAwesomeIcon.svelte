<script lang="ts">
	let clazz: string = '';
	export { clazz as class };
</script>

<span
	class="inline-block aspect-square h-[1rem] fill-current {clazz || ''}"
	{...$$restProps}>
	<slot /></span>
