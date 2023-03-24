<script lang="ts">
	type item = {
		label?: string;
		icon?: string;
		onclick: () => void;
		props?: any[];
	};
	export let items: item[] = [];
</script>

<nav aria-label="Breadcrumb">
	<ol class="flex items-center gap-1 text-gray-600">
		{#each items as i, c}
			<li
				class="block transition hover:text-gray-700"
				on:click={i.onclick}
				{...i?.props}>
				{@html i?.icon || ''}
				{i?.label}
			</li>
			{#if c < items.length - 1}
				<li>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clip-rule="evenodd" />
					</svg>
				</li>
			{/if}
		{/each}
	</ol>
</nav>
