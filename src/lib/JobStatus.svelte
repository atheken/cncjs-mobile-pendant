<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Modal from './Modal.svelte';
	import Divider from './Divider.svelte';

	export let model: AppController;

	let controller = model.controller;
	let load_file_requested = false;
	let selected_file: DirectoryEntry;
	let file_path = '';

	function number_to_time(milliseconds: number) {
		let seconds = Math.ceil(milliseconds / 1000);
		let result = '';
		if (seconds > 3600) {
			let hours = Math.floor(seconds / 3600);
			result += `${hours}:`;
			seconds %= 3600;
		}
		let minutes = Math.floor(seconds / 60);
		result += `${minutes < 10 ? '0' : ''}${minutes}:`;
		seconds = seconds % 60;
		result += `${seconds < 10 ? '0' : ''}${seconds}`;
		return result;
	}

	let time_stats = derived(model.controller, (c) => {
		let s = c?.sender;
		return {
			remaining: s?.remainingTime ? number_to_time(s.remainingTime) : 'N/A',
			ellapsed: s?.elapsedTime ? number_to_time(s.elapsedTime) : 'N/A'
		};
	});

	let jobcontext = derived(model.controller, (c) => c?.sender?.context);

	function load_file() {
		load_file_requested = false;
		model.load_gcode(`${file_path}/` + selected_file.name);
		console.debug(`Selected file requested to load: ${selected_file.name}`);
	}

	//Handle file selection:
	let files = writable<FileList>();

	files.subscribe(async (f) => {
		if (f?.length == 1) {
			let item = f.item(0);
			model.load_gcode(item.name, await item.text());
		}
	});
</script>

<div>
	<div class="btn-group px-2 text-center">
		<button
			class="btn-primary btn-sm"
			on:click={() => {
				model.start_or_resume_gcode();
			}}><span class="fa fa-play" /></button>
		<button
			class="btn-info btn-sm"
			on:click={() => {
				model.pause_gcode();
			}}><span class="fa fa-pause" /></button>
		<button
			class="btn-warning btn-sm"
			on:click={() => {
				model.stop_gcode();
			}}><span class="fa fa-stop" /></button>
		<button
			class="btn-error btn-sm"
			on:click={() => {
				model.unload_gcode();
			}}
			><span class="fa fa-close" />
		</button>
	</div>
	<div>
		<Divider>Job Status</Divider>
		Status: {$controller?.feeder?.activeState}
		<Divider>Loaded G-code</Divider>
		<span class="text-label text-xs">Loaded File:</span>
		<span class="text-sm italic">{$controller?.sender?.name || '<none>'}</span>
		<div class="grid grid-cols-2 gap-1 px-1">
			<div class="form-control max-w-xs">
				<input
					type="file"
					id="gcode_upload"
					bind:files={$files}
					class="file-input-bordered file-input file-input-sm w-full max-w-xs" />
			</div>
			<button class="btn btn-sm" on:click={() => (load_file_requested = true)}>Browse...</button>
		</div>
	</div>
	<Divider>Machine State</Divider>
	<div class="grid grid-cols-4">
		<div>Axis</div>
		<div>Min</div>
		<div>Max</div>
		<div>Dimension</div>
		<div>X</div>
		<div>{$jobcontext?.xmin}</div>
		<div>{$jobcontext?.xmax}</div>
		<div>X?</div>
		<div>Y</div>
		<div>{$jobcontext?.ymin}</div>
		<div>{$jobcontext?.ymax}</div>
		<div>Y?</div>
		<div>Z</div>
		<div>{$jobcontext?.zmin}</div>
		<div>{$jobcontext?.zmax}</div>
		<div>Z?</div>
	</div>
	<Divider>Job Stats</Divider>
	<div class="stats w-9/12 bg-slate-50 shadow">
		<div class="stat">
			<div class="stat-title">Progress</div>
			{#if $controller?.sender && $controller.sender.total > 0}
				<div class="stat-value">{Math.round(($controller.sender.sent / $controller.sender.total) * 100)}%</div>
				<div class="stat-desc">Sent {$controller.sender.sent} of {$controller.sender.total}</div>
			{:else}
				<div class="stat-value">N/A</div>
				<div class="stat-desc">Sent: N/A</div>
			{/if}
		</div>
		<div class="stat">
			<div class="stat-title">Time Remaining</div>
			<div class="stat-value">{$time_stats.remaining}</div>
			<div class="stat-desc">Ellapsed: {$time_stats.ellapsed}</div>
		</div>
	</div>

	<Modal visible={load_file_requested} on:dismiss-requested={() => (load_file_requested = false)}>
		<div slot="heading">Load G-code</div>
		<div slot="content">
			<FileBrowser {model} bind:selected_file bind:file_path />
			<div class="modal-action">
				<button disabled={!selected_file} class="btn" on:click={() => load_file()}>Select file</button>
			</div>
		</div>
	</Modal>
	{#if $controller?.sender}
		<Modal visible={$controller.sender?.hold || false} blockaccess={false}>
			<div slot="heading">Job on Hold</div>
			<div slot="content">
				{#if $controller.sender?.holdReason && !$controller.sender.holdReason.err}
					The job is on hold due to: {$controller.sender?.holdReason?.msg}.
					{#if $controller.sender.holdReason.data == 'M6'}
						<button class="btn btn-xs" on:click={() => {}}>Z-Probe</button>
					{/if}
				{:else if $controller.sender?.holdReason?.err}
					<div class="text-error">The job is on hold due to the following error:</div>
					<div class="text-monospace">{$controller.sender.holdReason.msg}</div>
				{:else}
					<div class="text-center">Job has been manually paused.</div>
				{/if}
				<button class="btn btn-xs text-right" on:click={() => model.start_or_resume_gcode()}>Continue</button>
			</div>
		</Modal>
	{/if}
</div>
