<script lang="ts">
	import type { AppController } from './AppController';
	import type { DirectoryEntry } from './models/local/DirectoryListing';
	import Icon from './Icon.svelte';

	export let model: AppController;
	export let file_path: string;

	export let selected_file: DirectoryEntry = null;

	function select_entry(selection: DirectoryEntry) {
		if (selection.type == 'f') {
			selected_file = selection;
		} else {
			set_path(`${file_path}/${selection.name}`);
		}
	}

	let invalidator = new Date();

	function set_path(new_path: string) {
		selected_file = null;
		file_path = new_path.replaceAll(/(^\/)|(\/$)/g, '');
		invalidator = new Date();
	}
</script>

<div>
	<div class="breadcrumbs text-sm">
		<ul>
			<li><button class="link" on:click={() => set_path('')}><Icon icon="home" /></button></li>
			<li>
				{#if file_path != ''}
					{#each file_path.split('/') as s, i}
						<li>
							<Icon icon="folder-open" />&nbsp;
							<button
								class="link"
								on:click={() =>
									set_path(
										file_path
											.split('/')
											.slice(0, i + 1)
											.join('/')
									)}
								>{s}
							</button>
						</li>
					{/each}
				{/if}
			</li>
		</ul>
	</div>
	{#key invalidator}
		{#await model.list_files(file_path)}
			<div class="text-center align-middle text-sm text-info">Loading file list...</div>
		{:then listing}
			{#if listing.files.length == 0}
				<div class="text-center align-middle text-sm text-info">This directory is empty.</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="table-compact table w-full">
						<thead>
							<th>Name</th>
							<th>Last Modified</th>
						</thead>
						<tbody>
							{#each listing.files as f (f.name)}
								<tr class="hover cursor-pointer" on:click={() => select_entry(f)} class:active={f == selected_file}>
									<td
										>{#if f.type == 'f'}<Icon icon="file-lines" />{:else}<Icon icon="folder" />{/if}
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
