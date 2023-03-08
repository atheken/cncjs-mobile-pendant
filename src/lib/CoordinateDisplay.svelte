<script lang="ts">
	import type { Readable } from 'svelte/store';
	import type { ControllerState } from './Controller';

	export let model: Readable<ControllerState>;
</script>

<div class="grid w-full grid-cols-7 text-center font-mono" style:border="1px solid gray">
	<div>Axes</div>
	<div class="col-span-3">Machine</div>
	<div class="col-span-3">Work</div>
	<div>X</div>
	<div class="col-span-3">{$model?.status.mpos.x}</div>
	<div class="col-span-3">{$model?.status.wpos.x}</div>
	<div>Y</div>
	<div class="col-span-3">{$model?.status.mpos.y}</div>
	<div class="col-span-3">{$model?.status.wpos.y}</div>
	<div>Z</div>
	<div class="col-span-3">{$model?.status.mpos.z}</div>
	<div class="col-span-3">{$model?.status.wpos.z}</div>
</div>
