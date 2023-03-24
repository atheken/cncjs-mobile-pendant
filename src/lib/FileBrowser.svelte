<script lang="ts">
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import Icon from './Icon.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import FullscreenNotice from './FullscreenNotice.svelte';

	export let model: AppController;
	export let file_path: string;
	export let commit_action: () => void;
	export let selected_file: DirectoryEntry = null;

	function select_entry(selection: DirectoryEntry) {
		if (selection.type == 'f') {
			selected_file = selection;
		} else {
			set_path(`${file_path}/${selection.name}`);
		}
	}

	let invalidator = new Date();
	let items = [];

	function set_path(new_path: string) {
		selected_file = null;
		file_path = new_path.replaceAll(/(^\/)|(\/$)/g, '');
		invalidator = new Date();
		items = [];
		items.push({
			label: '',
			icon: '<span class="fa fa-home"/>',
			onclick: () => {
				set_path('');
			}
		});

		let current = '';

		if (file_path != '') {
			let subs = file_path.split('/').map((s) => {
				current += `/${s}`;
				return {
					label: s,
					icon: '<span class="fa fa-folder-open"/>',
					onclick: () => {
						set_path(current);
					}
				};
			});
			items = items.concat(subs);
		}
	}

	set_path('/');
</script>

<div class="m-1 h-[60vh]">
	<div class="flex items-center space-x-1">
		<div class="text-xs text-neutral-400">Location:</div>
		<div class="grow text-xs">
			<Breadcrumbs bind:items />
		</div>
	</div>
	{#key invalidator}
		{#await model.list_files(file_path)}
			<div class="text-info text-center align-middle text-sm">
				Loading file list...
			</div>
		{:then listing}
			{#if listing.files.length == 0}
				<FullscreenNotice motif="none">
					<div slot="content" class="italic text-neutral-600">
						This directory is empty.
					</div>
				</FullscreenNotice>
			{:else}
				<div class="select-none overflow-x-auto">
					<table class="w-full text-xs">
						<thead>
							<th class="text-neutral-500">Name</th>
							<th class="text-neutral-500">Size</th>
							<th class="text-neutral-500">Last Modified</th>
						</thead>
						<tbody>
							{#each listing.files as f (f.name)}
								<tr
									class="hover cursor-pointer"
									on:click={() => select_entry(f)}
									on:dblclick={() => {
										if (f.type == 'f') {
											commit_action();
										}
									}}
									class:active={f == selected_file}>
									<td
										>{#if f.type == 'f'}<Icon icon="file-lines" />{:else}<Icon
												icon="folder" />{/if}
										{f.name}</td>
									<td>
										{f.size}
									</td>
									<td
										>{new Date(f.mtime).toLocaleString(undefined, {
											timeStyle: 'short',
											dateStyle: 'short'
										})}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/await}
	{/key}
</div>
