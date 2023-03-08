<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import type { Controller } from './Controller';
	import type { DirectoryEntry } from './DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Modal from './Modal.svelte';

	export let model: Controller;

	let load_file_requested = false;
	let selected_file: DirectoryEntry;
	let file_path = '';
	let loaded_file = model.loaded_gcode;
	let controller_state = model.controller_state;
	let sender = model.sender_status;
	let feeder = model.feeder_status;

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

	let time_stats = derived(sender, (s) => {
		return {
			remaining: s?.remainingTime ? number_to_time(s.remainingTime) : 'N/A',
			ellapsed: s?.elapsedTime ? number_to_time(s.elapsedTime) : 'N/A'
		};
	});

	let job_dimensions = derived(sender, (s) => s?.context);

	type states = '' | 'idle' | 'hold' | 'working' | 'alarm';
	let state = derived(controller_state, (c) => c.status.activeState);

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

{#key $sender}
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
			<div class="divider text-xs text-info">Machine State</div>
			Status: {$controller_state?.status.activeState}
			<div class="divider text-xs text-info">Loaded G-code</div>
			<div>
				<span class="text-label text-xs">Loaded File:</span>
				<span class="text-sm italic">{$sender?.name || '<none>'}</span>
			</div>

			<div class="h-1/2 overflow-scroll">
				{JSON.stringify($sender, null, ' ')}
			</div>
		</div>
		<div class="grid grid-cols-2 gap-1 px-1">
			<div class="form-control max-w-xs">
				<input
					type="file"
					id="gcode_upload"
					bind:files={$files}
					class="file-input-bordered file-input file-input-sm w-full max-w-xs" />
			</div>
			<button class="btn-sm btn" on:click={() => (load_file_requested = true)}>Browse...</button>
		</div>
		<div class="grid grid-cols-5">
			<div>Axis</div>
			<div>Min</div>
			<div>Max</div>
			<div>Dimension</div>
			<div>X</div>
			<div>{$controller_state?.status.activeState}</div>
			<div>{$job_dimensions}</div>
			<div>Dimension</div>
			<div>Y</div>
			<div>Min</div>
			<div>Max</div>
			<div>Dimension</div>
			<div>Z</div>
			<div>Min</div>
			<div>Max</div>
			<div>Dimension</div>
		</div>

		<div class="stats w-full bg-slate-50 shadow">
			<div class="stat">
				<div class="stat-title">Progress</div>
				{#if $sender && $sender.total > 0}
					<div class="stat-value">{Math.round(($sender.sent / $sender.total) * 100)}%</div>
					<div class="stat-desc">Sent {$sender.sent} of {$sender.total}</div>
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
		<Modal visible={$sender?.hold || false} blockaccess={false}>
			<div slot="heading">Job on Hold</div>
			<div slot="content">
				{#if $sender?.holdReason && !$sender.holdReason.err}
					The job is on hold due to: {$sender?.holdReason?.msg}.
					{#if $sender.holdReason.data == 'M6'}
						<button class="btn-xs btn" on:click={() => {}}>Z-Probe</button>
					{/if}
				{:else if $sender?.holdReason?.err}
					<div class="text-error">The job is on hold due to the following error:</div>
					<div class="text-monospace">{$sender.holdReason.msg}</div>
				{:else}
					<div class="text-center">Job has been manually paused.</div>
				{/if}
				<button class="btn-xs btn text-right" on:click={() => model.start_or_resume_gcode()}>Continue</button>
			</div>
		</Modal>
	</div>
{/key}
