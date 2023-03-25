<script lang="ts">
	export let elements: any[];
	export let labelFn: (any) => string;
	export let element: any;
</script>

<span class="inline-block rounded-lg border border-blue-500">
	{#each elements as a}
		<button
			on:click={() => {
				element = a;
			}}
			class="p-1 text-sm focus:relative"
			class:bg-blue-500={element == a}
			class:text-blue-500={element != a}
			class:text-white={element == a}>
			{labelFn(a)}
		</button>
	{/each}
</span>
