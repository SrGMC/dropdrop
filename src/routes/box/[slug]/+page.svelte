<script lang="ts">
	import { onMount } from 'svelte';
	import { addRecentBox } from '$lib/recentBoxes';
	import FileTable from '../FileTable.svelte';
	import CreateFolderPopup from '../CreateFolderPopup.svelte';
	import type { Directory } from '$lib/types';

	export let data: Directory;

	onMount(() => {
		addRecentBox(data.boxId);
	});
</script>

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
