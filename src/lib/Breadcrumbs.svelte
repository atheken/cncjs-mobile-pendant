<script lang="ts">
	export let items = [];
</script>

<nav aria-label="Breadcrumb">
	<ol role="list" class="flex items-center gap-1 text-sm text-gray-600">
		{#each items as i}
			<li class="block transition hover:text-gray-700" {...i?.props}>
				{@html i?.icon || ''}
				<span class="sr-only"> {i?.accessible_label} </span>
				{i?.label}
			</li>
		{/each}
	</ol>
</nav>
