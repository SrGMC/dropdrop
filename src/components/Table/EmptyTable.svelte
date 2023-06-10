<script lang="ts">
	import {
		Toolbar,
		ToolbarContent,
		InlineLoading,
		Button,
		Tile,
		ProgressBar
	} from 'carbon-components-svelte';
	import { openCreateFolderModal, state } from '$lib/files/browser';
	import { CloudUpload, FolderAdd } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	let innerWidth: number;

	onMount(() => {
		innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		window.addEventListener('resize', () => {
			innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		});
	});
</script>

<Toolbar>
	<ToolbarContent>
		{#if $state.uploading}
			<div style="padding: 10px 20px;">
				<InlineLoading description="Uploading file(s)..." />
			</div>
		{:else}
			<Button
				icon={CloudUpload}
				size="small"
				on:click={() => {
					//@ts-ignore
					document.querySelector('#fileUpload')?.click();
				}}
			>
				{#if innerWidth > 600}
					Upload file(s)
				{/if}
			</Button>
		{/if}
		<Button
			icon={FolderAdd}
			size="small"
			kind="secondary"
			on:click={() => {
				openCreateFolderModal.set(true);
			}}
		>
			{#if innerWidth > 600}
				Create folder
			{/if}
		</Button>
	</ToolbarContent>
</Toolbar>
{#if $state.uploading}
	<div class="upload-progress">
		<ProgressBar value={$state.progress} />
	</div>
{/if}
<Tile>
	<div class="empty">
		<h2>There are no files or folders in this path</h2>

		{#if $state.uploading}
			<InlineLoading description="Uploading file(s)..." />
		{:else}
			<!-- svelte-ignore a11y-invalid-attribute -->
			<p class="dragndrop">
				Drag and drop files to this window or click
				<a href="javascript:document.querySelector('#fileUpload').click();"> Upload file(s) </a> to upload
			</p>
		{/if}
	</div>
</Tile>

<style>
	.dragndrop {
		font-size: 1.1rem;
		margin-top: 20px;
		color: var(--cds-interactive-01, #0f62fe);
	}
	.upload-progress {
		margin-top: -10px;
	}
</style>
