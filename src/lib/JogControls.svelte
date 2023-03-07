<script lang="ts">
	import type { Controller } from './Controller';
	import CoordinateDisplay from './CoordinateDisplay.svelte';
	import Divider from './Divider.svelte';
	import Icon from './Icon.svelte';

	export let model: Controller;
	let mdi = model.mdi_commands;

	class JogCommand {
		constructor(
			public id: string,
			public icon?: string,
			public xfactor?: number | null,
			public yfactor?: number | null,
			public zfactor?: number | null,
			public mode: 'absolute' | 'relative' = 'relative',
			public content?: string
		) {}
	}

	let units = [0.001, 0.01, 0.1, 1, 10, 100];
	let jog_unit = 2;

	let xyControls = [
		new JogCommand('UL', 'arrow-left rotate-45', -1, 1),
		new JogCommand('Y+', 'arrow-up', null, 1),
		new JogCommand('UR', 'arrow-up rotate-45', 1, 1),
		new JogCommand('<', 'arrow-left', -1),
		new JogCommand('X0Y0', ' zero-xy font-mono font-thin', 0, 0, null, 'absolute'),
		new JogCommand('>', 'arrow-right', 1),
		new JogCommand('LL', 'arrow-down rotate-45', -1, -1),
		new JogCommand('Y-', 'arrow-down', null, -1),
		new JogCommand('LR', 'arrow-right rotate-45', 1, -1)
	];

	let zControls = [
		new JogCommand('Z+', 'arrow-up', null, null, 1),
		new JogCommand('Z0', ' zero-z font-mono font-thin', null, null, 0, 'absolute'),
		new JogCommand('Z-', 'arrow-down', null, null, -1)
	];

	function jog(ctl: JogCommand) {
		model.jog(ctl.xfactor, ctl.yfactor, ctl.zfactor, units[jog_unit], ctl.mode);
	}

	let active_port = model.active_port;
</script>

{#if $active_port}
	<Divider>Jog Machine</Divider>
	<div class="w-full px-2">
		<CoordinateDisplay model={model.controller_state} />
		<div class="grid w-full grid-cols-4 gap-2">
			<div class="col-span-3 grid grid-cols-3 p-1" style:border="1px solid">
				{#each xyControls as ctl (ctl.id)}
					<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}><Icon icon={ctl.icon} /></button>
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
						<button class="btn-outline btn btn-info btn-sm" on:click={() => jog(ctl)}><Icon icon={ctl.icon} /></button>
					{/each}
				</div>
				<div />
			</div>
		</div>
	</div>
	{#if $mdi.length > 0}
		<Divider>Machine Device Interface</Divider>
		<div class="grid grid-cols-3 justify-items-center">
			{#each $mdi as m (m.id)}
				<div class="w-full px-1 py-1 align-middle">
					<button class="btn btn-sm w-full align-middle" value={m.id} on:click={() => model.execute_mdi(m)}
						>{m.name}</button>
				</div>
			{/each}
		</div>
	{/if}
{:else}
	<div class="text-md h-screen bg-yellow-50 text-center text-amber-900">
		<div class="relative top-1/3">
			<p>
				<span class="fa-regular fa-triangle-exclamation text-4xl" />
			</p>
			<p>Machine controls are unavailable</p>
			<p>&nbsp;</p>
			<p class="text-xs">
				Machine controls are not currently unavailable because you are not connected to a machine. Please connect to a
				machine to continue.
			</p>
		</div>
	</div>
{/if}
