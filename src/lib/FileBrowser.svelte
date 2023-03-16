<script lang="ts">
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import Icon from './Icon.svelte';
	import Breadcrumbs from './Breadcrumbs.svelte';
	import { debug } from 'svelte/internal';

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
</script>

<div class="m-1">
	<Breadcrumbs bind:items />
	{#key invalidator}
		{#await model.list_files(file_path)}
			<div class="text-info text-center align-middle text-sm">
				Loading file list...
			</div>
		{:then listing}
			{#if listing.files.length == 0}
				<div class="text-info text-center align-middle text-sm">
					This directory is empty.
				</div>
			{:else}
				<div class="select-none overflow-x-auto">
					<table class="table-compact table w-full">
						<thead>
							<th>Name</th>
							<th>Last Modified</th>
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
									<td>{f.mtime}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/await}
	{/key}
</div>
