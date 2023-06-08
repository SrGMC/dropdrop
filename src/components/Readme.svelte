<script lang="ts">
	import { buildPath } from '$lib/files/common';
	import { Tile } from 'carbon-components-svelte';

	export let boxId: string;
	export let path: string[];
	export let readme: string;
</script>

<div class="readme">
	<Tile>
		<div class="above">
			<code>
				<a href={buildPath(boxId, path, 'README.md')} target="_blank">README.md</a>
			</code>
		</div>
		<div>{@html readme}</div>
	</Tile>
</div>

<style>
	.readme {
		margin-top: 10px;
		margin-bottom: 10px;
	}

	.readme div.above {
		margin-bottom: 15px;
	}
</style>
