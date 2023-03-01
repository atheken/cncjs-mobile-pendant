<script lang=ts>
    import type { Controller } from "./Controller";
    import FileBrowser from "./FileBrowser.svelte";

	export let model:Controller
	let state = model.workflow_state;

	let status = state.status;
	let load_file_requested= false;

	function load_file(){
		load_file_requested=true;
	}

	function select_file(){
		load_file_requested = false;
	}
</script>
<div>
	<div class:blur-sm={load_file_requested}> 
		Status: { $status }
		<button class=btn on:click={() => load_file() } >Load File</button>
	</div>
	<div class="modal" class:modal-open={load_file_requested} >
		<div class="modal-box">
			<FileBrowser model={model} />
		
		<div class="modal-action"><button class=btn on:click={()=> select_file() }>Select file</button></div>
		</div>
	</div>
</div>