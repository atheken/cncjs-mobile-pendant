<script lang="ts">
	export let value;
	export let label;
	export let detail = null;
</script>

<article class="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6">
	<div>
		<strong class="block text-sm font-medium text-gray-500"> {label} </strong>

		<p>
			<span class="text-2xl font-medium text-gray-900"> {value} </span>
			{#if detail}
				<span class="text-xs text-gray-500"> {detail} </span>
			{/if}
		</p>
	</div>
</article>
