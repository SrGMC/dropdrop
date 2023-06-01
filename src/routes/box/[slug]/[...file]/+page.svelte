<script lang="ts">
	import { onMount } from 'svelte';
	import { addRecentBox } from '$lib/recentBoxes';
	import FileTable from '../../FileTable.svelte';

	export let data: {
		boxId: string;
		path: string;
		files: { id: string; path: string; name: string; type: string; size: number }[];
	};

	onMount(() => {
		addRecentBox(data.boxId);
	});
</script>

<FileTable path={data.path} files={data.files} />
