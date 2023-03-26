<script lang="ts">
	export let elements: any[];
	export let labelFn: (any) => string;
	export let element: any;
	let classes = '';
	export { classes as class };
</script>

<span
	class="inline-block divide-x divide-blue-500 rounded-md text-sm {classes ||
		''}">
	{#each elements as a}
		<button
			on:click|preventDefault={() => (element = a)}
			class="min-w-[2rem] border-t border-b border-blue-500 p-1 first:rounded-l-md first:border-l last:rounded-r-md last:border-r focus:relative"
			class:bg-blue-500={element == a}
			class:text-blue-500={element != a}
			class:text-white={element == a}>
			{labelFn(a)}
		</button>
	{/each}
</span>
