<script lang="ts">
	import { onMount } from 'svelte';
	import { addRecentBox } from '$lib/recentBoxes';
	import FileTable from '../../../../components/FileTable.svelte';
	import CreateFolderPopup from '../../../../components/CreateFolderPopup.svelte';
	import { Download } from 'carbon-icons-svelte';
	import { downloadBase64AsFile } from '$lib/files/browser';
	import type { Directory, File } from '$lib/types';
	import { page } from '$app/stores';

	export let data: Directory | File;

	onMount(() => {
		addRecentBox(data.boxId);
		if (data.type == 'file') {
			downloadBase64AsFile(<string>data.base64, data.name);
			if ($page.url.searchParams.has('download')) {
				setTimeout(() => {
					window.close();
				}, 500)
			}
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
		<FileTable
			boxId={data.boxId}
			path={data.path}
			files={data.files}
			on:upload={(event) => {
				//@ts-ignore
				data.files = [...data.files, ...event.detail];
			}}
			on:remove={(event) => {
				//@ts-ignore
				event.detail.forEach((df) => {
					//@ts-ignore
					const file = data.files.find((f) => f.id == df);
					if (file) {
						//@ts-ignore
						data.files.splice(data.files.indexOf(file), 1);
					}
				});
				//@ts-ignore
				data.files = [...data.files];
			}}
		/>
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
