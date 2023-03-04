<script lang="ts">
	import type { Controller } from './lib/Controller';
	let model: Controller;
	let sender = model.sender_status;
	let feeder = model.feeder_status;
</script>

Sender State:
<pre class="code text-xs">{JSON.stringify($sender, null, 2)}</pre>
Feeder State:
<pre class="code text-xs">{JSON.stringify($feeder, null, 2)}</pre>
