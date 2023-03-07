<script lang="ts">
	import { writable } from 'svelte/store';
	import type { Controller } from './Controller';
	import type { DirectoryEntry } from './DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';

	export let model: Controller;
	let state = model.workflow_state;

	let status = state.status;
	let load_file_requested = false;
	let selected_file: DirectoryEntry;
	let file_path = '';
	let loaded_file = model.loaded_gcode;

	function display_modal() {
		load_file_requested = true;
	}

	function load_file() {
		load_file_requested = false;
		model.load_gcode(`${file_path}/` + selected_file.name);
		console.debug(`Selected file requested to load: ${selected_file.name}`);
	}

	let files = writable<FileList>();

	files.subscribe(async (f) => {
		if (f?.length == 1) {
			let item = f.item(0);
			model.load_gcode(item.name, await item.text());
		}
	});

	let grbl = model.controller_state;
	let sender = model.sender_status;
	let feeder = model.feeder_status;
</script>

<div>
	<div class:blur-sm={load_file_requested}>
		<div class="divider text-xs text-info">Machine State</div>
		Status: {$grbl?.status.activeState || 'Unknown'}
		<div class="divider text-xs text-info">Loaded G-code</div>
		<div>
			<span class="text-label text-xs">Loaded File:</span>
			<span class="text-sm italic">{$loaded_file || '<none>'}</span>
		</div>
		<div class="grid grid-cols-2 gap-1 px-1">
			<div class="form-control max-w-xs">
				<input
					type="file"
					id="gcode_upload"
					disabled={$status != 'idle'}
					bind:files={$files}
					class="file-input-bordered file-input file-input-sm w-full max-w-xs" />
			</div>
			<button class="btn btn-sm" disabled={$status != 'idle'} on:click={() => display_modal()}>Browse...</button>
		</div>
		<div class="btn-group px-2 text-center">
			<button
				class="btn-primary btn-sm"
				on:click={() => {
					model.start_or_resume_gcode();
				}}><Icon icon="play" /></button>
			<button
				class="btn-info btn-sm"
				on:click={() => {
					model.pause_gcode();
				}}><Icon icon="pause" /></button>
			<button
				class="btn-warning btn-sm"
				on:click={() => {
					model.stop_gcode();
				}}><Icon icon="stop" /></button>
			<button
				class="btn-error btn-sm"
				on:click={() => {
					model.unload_gcode();
				}}
				><Icon icon="close" />
			</button>
		</div>
	</div>
	<Modal visible={load_file_requested}>
		<div slot="heading">Load G-code</div>
		<div slot="content">
			<FileBrowser {model} bind:selected_file bind:file_path />
			<div class="modal-action">
				<button disabled={!selected_file} class="btn" on:click={() => load_file()}>Select file</button>
			</div>
		</div>
	</Modal>
</div>
