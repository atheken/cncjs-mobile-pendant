<script lang="ts">
  let units = [0.001, 0.01, 0.1, 1, 10, 100];
  let jog_unit = 2;
</script>

<div>
  <button>X-</button><button>X+</button>
  <button>Y-</button><button>Y+</button><button>Z-</button><button>Z+</button>
  <br />
  <div>
    <input
      type="range"
      min="0"
      max={units.length - 1}
      bind:value={jog_unit}
      class="range range-sm"
      step="1"
      class:range-error={jog_unit >= units.length - 1}
      class:range-success={jog_unit <= units.length / 2}
      class:range-warning={jog_unit > units.length / 2 && jog_unit < units.length - 1}
    />
    <div class="flex w-full justify-between py-4 text-xs">
      {#each units as u}
        <span class="rotate-45">{u} mm</span>
      {/each}
    </div>
  </div>
</div>
