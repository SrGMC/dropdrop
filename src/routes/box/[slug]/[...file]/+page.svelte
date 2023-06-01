<script lang="ts">
	import { onMount } from 'svelte';
	import { addRecentBox } from '$lib/recentBoxes';
	import FileTable from '../../FileTable.svelte';
	import CreateFolderPopup from '../../CreateFolderPopup.svelte';
	import { Download } from 'carbon-icons-svelte';
	import { buildPath, downloadBase64AsFile } from '$lib/files';
	import type { Directory, File } from '$lib/types';

	export let data: Directory | File;

	console.log('[...file]', data)

	function uploadFiles(event: any) {
		console.log(event.target.files);
		for (let i = 0; i < event.target.files.length; i++) {
			const file = event.target.files[i];
			const formData = new FormData();
			formData.append('file', file, file.name);

			console.log(file);

			fetch(buildPath(data.boxId, data.path, file.name), {
				method: 'POST',
				body: formData
			});
		}
	}

	onMount(() => {
		addRecentBox(data.boxId);
		if (data.type == 'file') {
			downloadBase64AsFile(<string>data.base64, data.name);
		}
	});
</script>

{#if data.type == 'dir'}
	<CreateFolderPopup
	boxId={data.boxId}
		path={data.path}
		bind:files={data.files}
		on:submit={(event) => {
			//@ts-ignore
			data.files.push(event.detail);
			//@ts-ignore
			data.files = [...data.files];
		}}
	/>
	{#key data.files}
		<FileTable boxId={data.boxId} path={data.path} files={data.files} />
	{/key}
{:else}
	<div class="content">
		<div>
			<Download size={32} />
			<h1>Downloading {data.name}</h1>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<p>
				If the download does not start,
				<a href="javascript:window.location.reload()">click here to try again</a>
			</p>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<p class="close"><a href="javascript:window.close();">Close tab</a></p>
		</div>
	</div>
{/if}

<input type="file" name="file" id="file" on:change={uploadFiles} />

<style>
	.content {
		display: flex;
		align-items: center;
		height: 100%;
		max-width: 800px;
	}

	p {
		margin: 10px 0;
	}

	p.close a {
		color: var(--cds-danger-01, #da1e28);
	}
</style>
