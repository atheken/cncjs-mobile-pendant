<script lang="ts">
	import { derived, writable } from 'svelte/store';
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import FileBrowser from './FileBrowser.svelte';
	import Modal from './Modal.svelte';
	import Divider from './Divider.svelte';
	import HoldReasonModal from './HoldReasonModal.svelte';
	import Stat from './Stat.svelte';
	import Dropdown from './Dropdown.svelte';
	import * as GCodePreview from 'gcode-preview';
	import { onMount } from 'svelte';

	export let model: AppController;

	let upload_input;
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

	let workflowstate = derived(
		model.controller,
		(c) => c?.workflow?.state || 'unknown'
	);
	let loaded_file = derived(model.controller, (c) => c?.sender.name);

	let preview: GCodePreview.WebGLPreview;
	let gcode_container: HTMLCanvasElement;

	onMount(() => {
		
		preview = GCodePreview.init({
			canvas: gcode_container,
			allowDragNDrop: true,
			debug: true
		});

		model.loaded_gcode.subscribe((g) => {
			let content = g?.content;
			if (content) {
				preview.processGCode(content);
				preview.render();
			}
		});
	});
</script>

<div class="scroll-contain flex h-full flex-col">
	<div class="flex grow flex-col">
		<div class="badge shadow-xs border text-center">
			{$workflowstate}
		</div>
		<div class="w-full">
			<Dropdown
				class="w-full"
				title="Load G-code"
				actions={[
					{
						label: 'From Watch Directory...',
						action: () => (load_file_requested = true)
					},
					{
						label: 'Upload...',
						action: () => {
							upload_input.click();
						}
					}
				]} />

			<input
				type="file"
				id="gcode_upload"
				bind:this={upload_input}
				bind:files={$files}
				class="hidden" />
		</div>
		<div class="w-full p-2">
			<div class="text-label text-xs">Loaded File:</div>
			<div class="text-sm italic">{$loaded_file || '<none>'}</div>
		</div>
		<canvas
			bind:this={gcode_container}
			class="aspect-square w-full bg-red-200" />
		<Divider>Job Stats</Divider>
		{#if $controller?.sender?.total > 0}
			<Stat
				label="Progress"
				detail="Sent {$controller.sender.sent} of {$controller.sender.total}"
				value="{Math.round(
					($controller.sender.sent / $controller.sender.total) * 100
				)}%" />
			<Stat
				label="Time Remaining"
				detail="Ellapsed: {$time_stats.ellapsed}"
				value={$time_stats.remaining} />
		{/if}

		<Modal
			visible={load_file_requested}
			on:dismiss-requested={() => (load_file_requested = false)}>
			<div slot="heading">Load G-code</div>
			<div slot="content" class="m-1">
				<FileBrowser
					{model}
					bind:selected_file
					bind:file_path
					commit_action={() => load_file()} />
			</div>
			<div slot="actions" class="flex w-full place-content-end p-1">
				<button
					disabled={!selected_file}
					class="btn-sm btn"
					on:click={() => load_file()}>Select file</button>
			</div>
		</Modal>
		{#if $controller?.sender?.hold}
			<HoldReasonModal {model} />
		{/if}
	</div>
	<div class="bg-white drop-shadow-toolbar">
		<div class="button-group flex w-full -space-x-[1px] overflow-hidden">
			<button
				disabled={!$loaded_file ||
					($workflowstate != 'paused' && $workflowstate != 'idle')}
				class="btn-sm btn grow border-0 bg-green-400 text-green-200"
				on:click={() => {
					model.start_or_resume_gcode();
				}}><span class="fa fa-play" /></button>
			<button
				disabled={!$loaded_file || $workflowstate != 'running'}
				class="btn-sm btn grow border-0 bg-blue-400 text-blue-200"
				on:click={() => {
					model.pause_gcode();
				}}><span class="fa fa-pause" /></button>

			<button
				disabled={!$loaded_file || $workflowstate != 'paused'}
				class="btn-sm btn grow border-0 bg-yellow-400 text-yellow-100"
				on:click={() => {
					model.stop_gcode();
				}}><span class="fa fa-stop" /></button>
			<button
				disabled={!$loaded_file || $workflowstate != 'idle'}
				class="btn-sm btn grow border-0 bg-red-500 text-red-200"
				on:click={() => {
					model.unload_gcode();
				}}
				><span class="fa fa-xmark" />
			</button>
		</div>
	</div>
</div>
