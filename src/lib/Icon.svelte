<script lang="ts">
	export let icon: string;

	$$props.class ||= '';
	$$props.class += ` fa fa-${icon}`;
	delete $$props.icon;
</script>

<span {...$$props} />
