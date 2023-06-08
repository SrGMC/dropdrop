<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { upload } from './Table/common';
	import Breadcrumb from './Breadcrumb.svelte';
	import DropZone from './DropZone.svelte';
	import Notifications from './Notifications.svelte';
	import Readme from './Readme.svelte';
	import Table from './Table/Table.svelte';
	import type { File } from '$lib/types';
	import { resetErrors, setStateAttribute, state } from '$lib/files/browser';

	const dispatch = createEventDispatcher();

	export let boxId: string;
	export let path: string[];
	export let files: File[];
	export let readme: string;

	let uploadInput;

	async function handleUploadFiles(event: any) {
		await uploadFiles(event.target.files);
		event.target.value = '';
	}

	async function handleDropFiles(event: any) {
		await uploadFiles(event.detail);
	}

	async function uploadFiles(inputFiles: any) {
		setStateAttribute('progress', 0);
		setStateAttribute('uploading', true);

		await upload(files, inputFiles, boxId, path, dispatch);
		setStateAttribute('uploading', false);
		setStateAttribute('progress', 0);

		setTimeout(() => {
			resetErrors();
		}, 5000);
	}
</script>

<DropZone on:drop={handleDropFiles} />

<div class="file-table">
	<Breadcrumb {boxId} {path} />

	<Table
		{boxId}
		{path}
		{files}
		on:remove={(e) => {
			dispatch('remove', e.detail);
		}}
		on:upload={(e) => {
			dispatch('upload', e.detail);
		}}
	/>

	{#if readme && readme.trim() != ''}
		<Readme {boxId} {path} {readme} />
	{/if}
</div>

<Notifications />

<input
	type="file"
	multiple
	style="display: none;"
	id="fileUpload"
	on:change={handleUploadFiles}
	bind:this={uploadInput}
/>

<style>
	.file-table {
		padding-bottom: 10px;
	}
</style>
