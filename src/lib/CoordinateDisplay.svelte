<script lang="ts">
	import { derived, type Readable } from 'svelte/store';
	import type ControllerInfo from './models/api/ControllerInfo';
	
	export let model: Readable<ControllerInfo>;
	let coords = derived(model, m => m?.controller?.state?.status)
</script>

<table class="w-full border-[1px] text-center">
	<thead class="rounded-sm text-center">
		<th class="text-center">Axes</th>
		<th>Machine</th>
		<th>Work</th>
	</thead>
	<tbody class="rounded-sm text-center">
		<tr>
			<td class="">X</td>
			<td class="">{$coords?.mpos.y}</td>
			<td class="">{$coords?.wpos.x}</td>
		</tr>
		<tr>
			<td class=" ">Y</td>
			<td class="">{$coords?.mpos.y}</td>
			<td class="">{$coords?.wpos.y}</td>
		</tr>
		<tr>
			<td class=" ">Z</td>
			<td class="">{$coords?.mpos.z}</td>
			<td class="">{$coords?.wpos.z}</td>
		</tr>
	</tbody>
</table>
