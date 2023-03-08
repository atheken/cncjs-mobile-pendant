<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { ControllerState } from './AppController';

	export let model: Readable<ControllerState>;
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
			<td class="">{$model?.status.mpos.x}</td>
			<td class="">{$model?.status.wpos.x}</td>
		</tr>
		<tr>
			<td class=" ">Y</td>
			<td class="">{$model?.status.mpos.y}</td>
			<td class="">{$model?.status.wpos.y}</td>
		</tr>
		<tr>
			<td class=" ">Z</td>
			<td class="">{$model?.status.mpos.z}</td>
			<td class="">{$model?.status.wpos.z}</td>
		</tr>
	</tbody>
</table>
