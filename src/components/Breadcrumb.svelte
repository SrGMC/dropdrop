<script lang="ts">
	import { buildPath } from '$lib/files/common';
	import { Breadcrumb } from 'carbon-components-svelte';

	export let boxId: string;
	export let path: string[];

	function generateBreadcrumbPaths() {
		let currentPath: string[] = [];
		let breadcrumbs = [
			{
				name: boxId,
				path: buildPath(boxId, currentPath)
			}
		];

		for (let i = 0; i < path.length; i++) {
			const file = path[i];
			breadcrumbs.push({
				name: file,
				path: buildPath(boxId, currentPath, file)
			});
			currentPath.push(file);
		}

		return breadcrumbs;
	}
</script>

<div class="breadcrumb">
	<Breadcrumb>
		{#each generateBreadcrumbPaths() as item, index}
			<li
				class={`bx--breadcrumb-item ${
					index == generateBreadcrumbPaths().length - 1 ? 'bx--breadcrumb-item--current' : ''
				}`}
			>
				<a href={item.path} class="bx--link" data-sveltekit-reload>
					{item.name}
				</a>
			</li>
		{/each}
	</Breadcrumb>
</div>

<style>
	.breadcrumb {
		margin-bottom: 10px;
	}
</style>
