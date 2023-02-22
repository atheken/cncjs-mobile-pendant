<script>
	export let coords;
</script>

<style>
.container {
	display: grid;
}
</style>

<div class=container>
	<span class=item>
		{# if coords.work }
	Work {coords.work.x}, {coords.work.y}, {coords.work.z} Machine 
		{/if}
		</span>

</div>