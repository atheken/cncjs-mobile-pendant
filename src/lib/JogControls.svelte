<script lang="ts">
	import type { Controller } from './Controller';
	import Divider from './Divider.svelte';

	export let model: Controller;

	type Axis = 'X' | 'Y' | 'Z';

	class JogControl {
		constructor(public label: string, public xfactor: number, public yfactor: number, public zfactor: number) {}
	}

	class MoveControl {
		constructor(public label: string, public axes: Axis[]) {}
	}

	let units = [0.001, 0.01, 0.1, 1, 10, 100];
	let jog_unit = 2;

	let xyControls = [
		new JogControl('UL', -1, 1, 0),
		new JogControl('Y+', 0, 1, 0),
		new JogControl('UR', 1, 1, 0),
		new JogControl('<', -1, 0, 0),
		new MoveControl('0', ['X', 'Y']),
		new JogControl('>', 1, 0, 0),
		new JogControl('LL', -1, -1, 0),
		new JogControl('Y-', 0, -1, 0),
		new JogControl('LR', 1, -1, 0)
	];

	let zControls = [new JogControl('Z+', 0, 0, 1), new MoveControl('0', ['Z']), new JogControl('Z-', 0, 0, -1)];

	function jog(ctl: MoveControl | JogControl) {}
</script>

<Divider>Jog Machine</Divider>
<div class="w-full px-2">
	<div class="grid w-full grid-cols-4 gap-2">
		<div class="col-span-3 grid grid-cols-3 p-1" style:border="1px solid">
			{#each xyControls as ctl}
				<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}>{ctl.label}</button>
			{/each}
			<div class="col-span-3 py-2">
				<input
					type="range"
					min="0"
					max={units.length - 1}
					bind:value={jog_unit}
					class="range range-sm"
					step="1"
					class:range-error={jog_unit >= units.length - 1}
					class:range-success={jog_unit <= units.length / 2}
					class:range-warning={jog_unit > units.length / 2 && jog_unit < units.length - 1} />
				<div class="flex w-full justify-between py-4 text-xs">
					{#each units as u}
						<span class="rotate-45">{u} mm</span>
					{/each}
				</div>
			</div>
		</div>
		<div class="grid grid-cols-1 p-1" style:border="1px solid">
			<div class="btn-group-vertical btn-group">
				{#each zControls as ctl}
					<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}>{ctl.label}</button>
				{/each}
			</div>
			<div />
		</div>
	</div>
</div>
