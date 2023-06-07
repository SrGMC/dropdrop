<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		ToolbarSearch,
		Pagination,
		Button,
		ToolbarBatchActions,
		Tile,
		FileUploaderDropContainer,
		InlineNotification,
		InlineLoading
	} from 'carbon-components-svelte';
	import prettyBytes from 'pretty-bytes';
	import {
		DocumentBlank,
		Folder,
		Image,
		Music,
		TextFont,
		Document,
		Video,
		Book,
		DocumentPdf,
		PresentationFile,
		TableSplit,
		Archive,
		CloudUpload,
		TrashCan,
		FolderAdd,
		Download
	} from 'carbon-icons-svelte';
	import type { File } from '$lib/types';
	import { buildPath, getMimeTypeInfo } from '$lib/files/common';
	import { deleteFileOrFolder, uploadFiles, openCreateFolderModal } from '$lib/files/browser';
	import Breadcrumb from './Breadcrumb.svelte';
	import { createEventDispatcher } from 'svelte';
	import { page } from '$app/stores';

	const dispatch = createEventDispatcher();

	export let boxId: string;
	export let path: string[];
	export let files: File[];
	let innerWidth: number;

	$: rows = files.map((file, i) => {
		return {
			id: file.id,
			name: file.name,
			path: file.path,
			type: file.mime?.name,
			mime: file.mime,
			size: file.mime?.type == 'dir' ? '' : prettyBytes(file.size || 0)
		};
	});
	let pageSize = 50;
	let tablePage = 1;
	let filteredRowIds: any[] = [];
	let filterValue = '';
	let selectedRowIds: any[] = [];

	let state = {
		error: {
			size: false,
			upload: false
		},
		uploading: false,
		deleting: false
	};

	async function upload(event: any) {
		state.error = {
			size: false,
			upload: false
		};
		state.uploading = true;

		const inputFiles = event.detail ? event.detail : event.target.files;
		let newFiles: File[] = [];
		let newFileCount = 1;
		for (let i = 0; i < inputFiles.length; i++) {
			const file = inputFiles[i];
			if (file.size > 10485760) {
				state.error.size = true;
			} else {
				newFiles.push({
					id: files.length + newFileCount,
					type: 'file',
					boxId: boxId,
					path: [...path, file.name],
					name: file.name,
					mime: getMimeTypeInfo(file.type),
					size: file.size
				});
				newFileCount++;
			}
		}

		const result = await uploadFiles(inputFiles, boxId, path);
		dispatch('upload', newFiles);

		if (!result) {
			state.error.upload = true;
		}
		state.uploading = false;
	}

	async function remove() {
		state.deleting = true;
		const result = [];
		for (let i = 0; i < selectedRowIds.length; i++) {
			const id = selectedRowIds[i];
			const file = files.find((f) => f.id == id);
			if (file) {
				// TODO: Add try-catch
				await deleteFileOrFolder(boxId, file.path);
				result.push(id);
			}
		}

		selectedRowIds = [];

		dispatch('remove', result);
		state.deleting = false;
	}

	async function download() {
		for (let i = 0; i < selectedRowIds.length; i++) {
			const id = selectedRowIds[i];
			const file = files.find((f) => f.id == id);
			if (file) {
				window.open(
					`${$page.url.protocol}//${$page.url.host}${buildPath(boxId, file.path)}?download=true`
				);
			}
		}

		selectedRowIds = [];
	}
</script>

<svelte:window bind:innerWidth />

<Breadcrumb {boxId} {path} />

{#if rows.length <= 0}
	<Toolbar>
		<ToolbarContent>
			{#if state.uploading}
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
					{#if innerWidth > 500}
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
				{#if innerWidth > 500}
					Create folder
				{/if}
			</Button>
		</ToolbarContent>
	</Toolbar>
	<Tile>
		<div class="empty">
			<h2>There are no files or folders in this path</h2>

			{#if state.uploading}
				<InlineLoading description="Uploading file(s)..." />
			{:else}
				<FileUploaderDropContainer
					multiple
					labelText="Drag and drop files here or click to upload"
					on:change={upload}
				/>
			{/if}
		</div>
	</Tile>
{:else}
	<DataTable
		sortable
		batchSelection
		bind:selectedRowIds
		headers={innerWidth < 500
			? [
					{ key: 'name', value: 'Name' },
					{ key: 'size', value: 'Size' }
			  ]
			: [
					{ key: 'name', value: 'Name' },
					{ key: 'type', value: 'Type' },
					{ key: 'size', value: 'Size' }
			  ]}
		{rows}
		{pageSize}
		page={tablePage}
	>
		<Toolbar>
			<ToolbarBatchActions>
				<div class:deleting={state.deleting}>
					{#if state.deleting}
						<div class="delete-file">
							<InlineLoading description="Deleting..." />
						</div>
					{:else}
						<Button icon={Download} on:click={download}>Download</Button>
						<Button icon={TrashCan} on:click={remove} kind="danger">Delete</Button>
					{/if}
				</div>
			</ToolbarBatchActions>
			<ToolbarContent>
				<ToolbarSearch bind:value={filterValue} shouldFilterRows bind:filteredRowIds />
				{#if state.uploading}
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
						{#if innerWidth > 500}
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
					{#if innerWidth > 500}
						Create folder
					{/if}
				</Button>
			</ToolbarContent>
		</Toolbar>

		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'name'}
				<a
					href={buildPath(boxId, path, row.name)}
					class="bx--link"
					target={row.mime.type == 'dir' ? '_self' : '_blank'}
					data-sveltekit-reload
				>
					{#if row.mime.type == 'application'}
						<DocumentBlank /> {cell.value}
					{:else if row.mime.type == 'audio'}
						<Music /> {cell.value}
					{:else if row.mime.type == 'font'}
						<TextFont /> {cell.value}
					{:else if row.mime.type == 'image'}
						<Image /> {cell.value}
					{:else if row.mime.type == 'text'}
						<Document /> {cell.value}
					{:else if row.mime.type == 'video'}
						<Video />{cell.value}
					{:else if row.mime.type == 'epub'}
						<Book />{cell.value}
					{:else if row.mime.type == 'pdf'}
						<DocumentPdf />{cell.value}
					{:else if row.mime.type == 'powerpoint'}
						<PresentationFile />{cell.value}
					{:else if row.mime.type == 'excel'}
						<TableSplit />{cell.value}
					{:else if row.mime.type == 'word'}
						<Document />{cell.value}
					{:else if row.mime.type == 'archive'}
						<Archive />{cell.value}
					{:else if row.mime.type == 'dir'}
						<Folder />{cell.value}
					{:else}
						<DocumentBlank /> {cell.value}
					{/if}
				</a>
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

<input type="file" multiple style="display: none;" id="fileUpload" on:change={upload} />

<div class="notifications">
	{#if state.error.size}
		<InlineNotification
			lowContrast
			kind="error"
			title="Error:"
			subtitle="Files must be 10MB in size or lower."
			hideCloseButton={true}
		/>
	{/if}
	{#if state.error.upload}
		<InlineNotification
			lowContrast
			kind="error"
			title="Error:"
			subtitle="Couldn't upload files. Please, try again later."
			hideCloseButton={true}
		/>
	{/if}
</div>

<style>
	.empty {
		margin: 20px 15px;
	}

	.empty h2 {
		margin-top: 20px;
	}

	.notifications {
		position: fixed;
		bottom: 15px;
		right: 15px;
	}
</style>
