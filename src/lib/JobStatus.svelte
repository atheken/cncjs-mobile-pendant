<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Modal from './Modal.svelte';
	import Divider from './Divider.svelte';
	import HoldReasonModal from './HoldReasonModal.svelte';

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

	let workflowstate = derived(model.controller, (c) => c?.workflow?.state || 'unknown');
</script>

<div class="grid grid-cols-1 justify-items-center">
	<div class="flex w-full place-content-center">
		<div class="flex-basis-1/3"><span class="badge">{$workflowstate}</span></div>
		<div class="flex-basis-2/3 px-2 text-white">
			<button
				disabled={$workflowstate != 'paused' && $workflowstate != 'idle'}
				class="btn-sm btn bg-green-400"
				on:click={() => {
					model.start_or_resume_gcode();
				}}><span class="fa fa-play" /></button>
			<button
				disabled={$workflowstate != 'running'}
				class="btn-sm btn bg-blue-400 "
				on:click={() => {
					model.pause_gcode();
				}}><span class="fa fa-pause" /></button>

			<button
				class="btn-sm btn bg-yellow-400"
				on:click={() => {
					model.stop_gcode();
				}}><span class="fa fa-stop" /></button>
			<button
				class="btn-sm btn bg-red-500"
				on:click={() => {
					model.unload_gcode();
				}}
				><span class="fa fa-xmark" />
			</button>
		</div>
	</div>
	<Divider>Loaded G-code</Divider>
	<div>
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
			<button class="btn-sm btn" on:click={() => (load_file_requested = true)}>Browse...</button>
		</div>
	</div>

	<Divider>Job Stats</Divider>
	<div class="w-9/12-md stats w-[97%] border-[1px] bg-slate-50">
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
		</div>
		<div slot="actions">
			<button disabled={!selected_file} class="btn-md btn bg-green-500" on:click={() => load_file()}
				>Select file</button>
		</div>
	</Modal>
	{#if $controller?.sender?.hold}
		<HoldReasonModal {model} />
	{/if}
</div>
