<script lang="ts">
	export let icon: string;

	$$props.class ||= '';
	$$props.class += ` mu mu-${icon}`;
	delete $$props.icon;
</script>

<span {...$$props} />
