<script lang=ts>
    import type { Controller } from "./Controller";
    import type { DirectoryEntry } from "./DirectoryListing";
    import FileBrowser from "./FileBrowser.svelte";

	export let model:Controller
	let state = model.workflow_state;

	let status = state.status;
	let load_file_requested= false;
	let selected_file:string

	function display_modal(){
		load_file_requested=true;
	}

	function select_file(file:CustomEvent<string>){
		selected_file = file.detail;
	}

	function load_file(){
		load_file_requested=false;
		console.debug(`Selected file requested to load: ${selected_file}`)
	}

</script>
<div>
	<div class:blur-sm={load_file_requested}> 
		Status: { $status }
		<button class=btn on:click={() => display_modal() } >Load File</button>
	</div>
	<div class="modal" class:modal-open={load_file_requested}  on:keyup={e=> console.log(e.code)}>
		<div class="modal-box">
			<FileBrowser model={model} on:file-selected={select_file} />
		<div class="modal-action">
			<button disabled={!selected_file} class=btn on:click={()=> load_file() }>Select file</button></div>
		</div>
	</div>
</div>