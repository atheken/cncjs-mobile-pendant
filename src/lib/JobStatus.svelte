<script>
	export let model = {
		status : 'unknown',
		loaded_file : null
	};
</script>
<div>
	{#if model.loaded_file }
	<span> Loaded file: { model.loaded_file }</span>
	{:else}
		<span>No file loaded.</span>
	{/if}
<hr/>
<button>
	Go
</button>
<button>
	Pause
</button>
<button>
	Stop
</button>
	
</div>