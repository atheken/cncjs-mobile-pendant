<script lang=ts>
    import type { WorkflowState } from "./Controller";

	export let model:WorkflowState

	let status = model.status;

</script>
<div>
	Status: { $status }
</div>