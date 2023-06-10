<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		ToolbarSearch,
		Pagination,
		Button,
		ToolbarBatchActions,
		InlineLoading,
		OverflowMenu,
		OverflowMenuItem,
		ProgressBar,
		Truncate
	} from 'carbon-components-svelte';
	import { buildPath } from '$lib/files/common';
	import { CloudUpload, TrashCan, FolderAdd, Download } from 'carbon-icons-svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import {
		deleteFileOrFolder,
		openCreateFolderModal,
		setStateAttribute,
		state
	} from '$lib/files/browser';
	import { download, remove } from './common';
	import { page } from '$app/stores';
	import EmptyTable from './EmptyTable.svelte';
	import FilenameCell from './FilenameCell.svelte';
	import prettyBytes from 'pretty-bytes';
	import type { File } from '$lib/types';

	const dispatch = createEventDispatcher();

	export let boxId: string;
	export let path: string[];
	export let files: File[];

	let innerWidth: number;

	$: rows = files.map((file) => {
		return {
			id: file.id,
			name: file.name,
			path: file.path,
			type: file.mime?.name,
			mime: file.mime,
			size: file.mime?.type == 'dir' ? '' : prettyBytes(file.size || 0)
		};
	});
	let sortKey = 'name';
	let pageSize = 50;
	let tablePage = 1;
	let filteredRowIds: any[] = [];
	let filterValue = '';
	let selectedRowIds: any[] = [];
	let headers = [
		{ key: 'name', value: 'Name' },
		{ key: 'type', value: 'Type', width: '10rem' },
		{ key: 'size', value: 'Size', width: '10rem' },
		{ key: 'menu', empty: true, width: '5rem' }
	];
	$: {
		if (innerWidth < 650) {
			headers = [
				{ key: 'name', value: 'Name' },
				{ key: 'menu', empty: true, width: '4rem' }
			];
		} else if (innerWidth < 850) {
			headers = [
				{ key: 'name', value: 'Name' },
				{ key: 'size', value: 'Size', width: '10rem' },
				{ key: 'menu', empty: true, width: '5rem' }
			];
		} else {
			headers = [
				{ key: 'name', value: 'Name' },
				{ key: 'type', value: 'Type', width: '10rem' },
				{ key: 'size', value: 'Size', width: '10rem' },
				{ key: 'menu', empty: true, width: '5rem' }
			];
		}
	}

	async function removeFiles() {
		setStateAttribute('deleting', true);
		await remove(files, selectedRowIds, boxId, dispatch);
		selectedRowIds = [];
		setStateAttribute('deleting', false);
	}

	async function downloadFiles() {
		download(files, selectedRowIds, boxId, $page.url);
		selectedRowIds = [];
	}

	onMount(() => {
		innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		window.addEventListener('resize', () => {
			innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		});
	});
</script>

{#if rows.length <= 0}
	<EmptyTable />
{:else}
	<DataTable
		sortable
		bind:sortKey
		sortDirection="ascending"
		batchSelection
		bind:selectedRowIds
		{headers}
		{rows}
		{pageSize}
		page={tablePage}
	>
		<Toolbar>
			<ToolbarBatchActions>
				<div class:deleting={$state.deleting}>
					{#if $state.deleting}
						<div class="delete-file">
							<InlineLoading description="Deleting..." />
						</div>
					{:else}
						<Button icon={Download} on:click={downloadFiles}>Download</Button>
						<Button icon={TrashCan} on:click={removeFiles} kind="danger">Delete</Button>
					{/if}
				</div>
			</ToolbarBatchActions>
			<ToolbarContent>
				<ToolbarSearch bind:value={filterValue} shouldFilterRows bind:filteredRowIds />
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

		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'name'}
				<FilenameCell {boxId} {path} name={row.name} mime={row.mime} />
			{:else if cell.key === 'menu'}
				<OverflowMenu flipped>
					<OverflowMenuItem
						text="Download"
						href={buildPath(boxId, path, row.name)}
						target="_blank"
					/>
					<OverflowMenuItem
						danger
						text="Delete"
						on:click={async () => {
							await deleteFileOrFolder(boxId, row.path);
							dispatch('remove', [row.id]);
						}}
					/>
				</OverflowMenu>
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>

	<Pagination
		bind:pageSize
		bind:page={tablePage}
		totalItems={filteredRowIds.length}
		pageSizeInputDisabled
	/>
{/if}

<style>
	.upload-progress {
		margin-top: -10px;
	}
</style>
