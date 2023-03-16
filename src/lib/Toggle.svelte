<script lang="ts">
	export let checked: boolean = false;
	export let label = '';
</script>

<label class="flex content-center">
	<div class="relative h-6 w-12 cursor-pointer">
		<input type="checkbox" bind:checked class="peer sr-only" />

		<span
			class="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-green-500" />

		<span
			class="absolute inset-0 m-1 aspect-square h-4 rounded-full bg-white transition peer-checked:translate-x-6" />
	</div>
	<div class="grow px-1 text-sm">{label}</div>
</label>
