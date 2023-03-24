<script lang="ts">
	import { derived } from 'svelte/store';
	import type { AppController } from './AppController';
	import CoordinateDisplay from './CoordinateDisplay.svelte';
	import Divider from './Divider.svelte';
	import FullscreenNotice from './FullscreenNotice.svelte';
	import Icon from './FontAwesomeIcon.svelte';
	import SpindleControl from './SpindleControl.svelte';

	export let model: AppController;
	let mdi = derived(model.mdi_commands, (f) => f.records);

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
		new JogCommand(
			'X0Y0',
			' zero-xy font-mono font-thin',
			0,
			0,
			null,
			'absolute'
		),
		new JogCommand('>', 'arrow-right', 1),
		new JogCommand('LL', 'arrow-down rotate-45', -1, -1),
		new JogCommand('Y-', 'arrow-down', null, -1),
		new JogCommand('LR', 'arrow-right rotate-45', 1, -1)
	];

	let zControls = [
		new JogCommand('Z+', 'arrow-up', null, null, 1),
		new JogCommand(
			'Z0',
			' zero-z font-mono font-thin',
			null,
			null,
			0,
			'absolute'
		),
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
		<CoordinateDisplay model={model.controller} />
		<div class="card grid w-full grid-cols-4 gap-2">
			<div class="col-span-3 grid grid-cols-3 p-1">
				{#each xyControls as ctl (ctl.id)}
					<button
						class="btn-outline btn btn-info btn-sm"
						on:click={() => jog(ctl)}><Icon icon={ctl.icon} /></button>
				{/each}
				<div class="col-span-3 py-2">
					<input
						type="range"
						min="0"
						max={units.length - 1}
						bind:value={jog_unit}
						class="range input w-full bg-red-300"
						step="1"
						class:range-error={jog_unit >= units.length - 1}
						class:range-success={jog_unit <= units.length / 2}
						class:range-warning={jog_unit > units.length / 2 &&
							jog_unit < units.length - 1} />
					<div class="flex w-full justify-between py-4 text-xs">
						{#each units as u}
							<span class="rotate-45">{u} mm</span>
						{/each}
					</div>
				</div>
			</div>
			<div class="grid grid-cols-1 p-1">
				{#each zControls as ctl (ctl.id)}
					<button
						class="btn-outline btn btn-info btn-sm"
						on:click={() => jog(ctl)}><Icon icon={ctl.icon} /></button>
				{/each}
			</div>
		</div>
	</div>
	{#if $mdi.length > 0}
		<Divider>Machine Device Interface</Divider>
		<div class="grid grid-cols-3 justify-items-center">
			{#each $mdi as m (m.id)}
				<div class="w-full px-1 py-1 align-middle">
					<button
						class="btn btn-sm w-full align-middle"
						value={m.id}
						on:click={() => model.execute_mdi(m)}>{m.name}</button>
				</div>
			{/each}
		</div>
	{/if}
	<SpindleControl controller={model} current_machine={null} />
{:else}
	<FullscreenNotice>
		<span slot="icon" class="fa-regular fa-triangle-exclamation" />
		<p slot="heading">Machine controls are unavailable.</p>
		<p slot="content">
			Machine controls are not currently unavailable because you are not
			connected to a machine. Please connect to a machine to continue.
		</p>
	</FullscreenNotice>
{/if}
