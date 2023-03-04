<script lang="ts">
	import type { Controller } from './Controller';
	import Divider from './Divider.svelte';

	export let model: Controller;

	class JogCommand {
		constructor(
			public id: string,
			public xfactor: number | null = null,
			public yfactor: number | null = null,
			public zfactor: number | null = null,
			public mode: 'absolute' | 'relative' = 'relative'
		) {}
	}

	let units = [0.001, 0.01, 0.1, 1, 10, 100];
	let jog_unit = 2;

	let xyControls = [
		new JogCommand('UL', -1, 1),
		new JogCommand('Y+', null, 1),
		new JogCommand('UR', 1, 1),
		new JogCommand('<', -1),
		new JogCommand('X0Y0', 0, 0, null, 'absolute'),
		new JogCommand('>', 1),
		new JogCommand('LL', -1, -1),
		new JogCommand('Y-', null, -1),
		new JogCommand('LR', 1, -1)
	];

	let zControls = [
		new JogCommand('Z+', null, null, 1),
		new JogCommand('Z0', null, null, 0, 'absolute'),
		new JogCommand('Z-', null, null, -1)
	];

	function jog(ctl: JogCommand) {
		model.jog(ctl.xfactor, ctl.yfactor, ctl.zfactor, units[jog_unit], ctl.mode);
	}
</script>

<Divider>Jog Machine</Divider>
<div class="w-full px-2">
	<div class="grid w-full grid-cols-4 gap-2">
		<div class="col-span-3 grid grid-cols-3 p-1" style:border="1px solid">
			{#each xyControls as ctl (ctl.id)}
				<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}>{ctl.id}</button>
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
				{#each zControls as ctl (ctl.id)}
					<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}>{ctl.id}</button>
				{/each}
			</div>
			<div />
		</div>
	</div>
</div>
