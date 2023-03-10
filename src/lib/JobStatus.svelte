<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Modal from './Modal.svelte';
	import Divider from './Divider.svelte';
	import HoldReasonModal from './HoldReasonModal.svelte';
	import Stat from './Stat.svelte';

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
	let loaded_file = derived(model.controller, (c) => c?.sender.name);
</script>

<div class="grid grid-cols-1 justify-items-center">
	<div class="flex w-full place-content-center machine-controls">
		<div class="flex-basis-1/3"><span class="badge">{$workflowstate}</span></div>
		<div class="flex-basis-2/3 px-2 text-white">
			<button
				disabled={!$loaded_file || ($workflowstate != 'paused' && $workflowstate != 'idle')}
				class="btn-sm btn bg-green-400"
				on:click={() => {
					model.start_or_resume_gcode();
				}}><span class="fa fa-play" /></button>
			<button
				disabled={!$loaded_file || $workflowstate != 'running'}
				class="btn-sm btn bg-blue-400 "
				on:click={() => {
					model.pause_gcode();
				}}><span class="fa fa-pause" /></button>

			<button
				disabled={!$loaded_file || $workflowstate != 'paused'}
				class="btn-sm btn bg-yellow-400"
				on:click={() => {
					model.stop_gcode();
				}}><span class="fa fa-stop" /></button>
			<button
				disabled={!$loaded_file || $workflowstate != 'idle'}
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
		<div class="p-2 text-center">
			<div class="text-label text-xs">Loaded File:</div>
			<div class="text-sm italic">{$loaded_file || '<none>'}</div>
		</div>
		<div class="dropdown">
			<label tabindex="0" class="btn-sm btn">Load G-code &nbsp;<span class="fa fa-chevron-down" /></label>
			<ul tabindex="0" class="dropdown-content menu">
				<li class="btn-sm btn">
					<label>
						<input
							type="file"
							id="gcode_upload"
							bind:files={$files}
							class="file-input-bordered file-input file-input-sm hidden w-full max-w-xs" />
						Upload...
					</label>
				</li>
				<li class="btn-sm btn">
					<button class="" on:click={() => (load_file_requested = true)}>Browse...</button>
				</li>
			</ul>
		</div>
	</div>

	<Divider>Job Stats</Divider>
	{#if $controller?.sender?.total > 0}
	<Stat label="Progress" detail="Sent {$controller.sender.sent} of {$controller.sender.total}"
	 value="{Math.round(($controller.sender.sent / $controller.sender.total) * 100)}%"/>
	 <Stat label="Time Remaining" detail="Ellapsed: {$time_stats.ellapsed}"
	 value="{$time_stats.remaining}"/>
	{/if}

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
