<script lang="ts">
	let hidden = true;
	type action = { label: string; action: () => void };
	export let actions: action[];
	export let title: string;
</script>

<div class="relative">
	<div
		class="inline-flex items-center divide-x divide-gray-100 overflow-hidden rounded-md border bg-white">
		<button
			on:click={() => {
				hidden = !hidden;
			}}
			class="inline-flex space-x-1 px-2 py-2 text-sm leading-none text-gray-600 hover:bg-gray-50 hover:text-gray-700">
			<span class="sr-only">Menu</span>
			<span class=""> {title}</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				viewBox="0 0 20 20"
				fill="currentColor">
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd" />
			</svg>
		</button>
	</div>

	<div
		class="absolute z-10 mt-2 w-56 rounded-md border border-gray-100 bg-white shadow-lg"
		role="menu"
		class:hidden>
		<div class="p-2">
			{#each actions as a (a.label)}
				<button
					on:click={() => {
						a.action();
						hidden = true;
					}}
					role="menuitem"
					class="block cursor-pointer rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700">
					{a.label}
				</button>
			{/each}
		</div>
	</div>
</div>
