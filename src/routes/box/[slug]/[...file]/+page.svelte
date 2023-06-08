<script lang="ts">
	import { onMount } from 'svelte';
	import { addRecentBox } from '$lib/recentBoxes';
	import CreateFolderPopup from '../../../../components/CreateFolderPopup.svelte';
	import type { Directory, File } from '$lib/types';
	import { buildPath } from '$lib/files/common';
	import FileDisplay from '../../../../components/FileDisplay.svelte';
	import DirectoryDisplay from '../../../../components/DirectoryDisplay.svelte';

	export let data: Directory | File;

	onMount(() => {
		addRecentBox(data.boxId);
	});
</script>

<svelte:head>
	<title>DropDrop | {buildPath(data.boxId, data.path, undefined, false)}</title>
</svelte:head>

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
		<DirectoryDisplay
			boxId={data.boxId}
			files={data.files}
			path={data.path}
			readme={data.readme || ''}
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
	<FileDisplay base64={data.base64 || ''} name={data.name} />
{/if}
