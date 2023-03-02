<script lang="ts">
  export let icon: string;
  export let classes: string[] = [];
</script>

<span class="mu mu-{icon} {classes?.join(' ')}" />
