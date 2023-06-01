<script lang="ts">
	import 'carbon-components-svelte/css/all.css';
	import '../styles.css';
	import {
		Content,
		Header,
		Button,
		HeaderUtilities,
		SkipToContent,
		Tooltip,
		TextInput
	} from 'carbon-components-svelte';
	import { CloudUpload, Folder } from 'carbon-icons-svelte';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { openCreateFolderModal } from '$lib/files';

	let theme = 'white'; // "white" | "g10" | "g80" | "g90" | "g100"
	let innerWidth: number;
</script>

<svelte:window bind:innerWidth />

<Header company="DropDrop" href="/">
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	{#if $page.url.pathname != '/'}
		<HeaderUtilities>
			<Button
				icon={Folder}
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
			<Button icon={CloudUpload} size="small">
				{#if innerWidth > 500}
					Upload file(s)
				{/if}
			</Button>
		</HeaderUtilities>
	{/if}
</Header>

<Content>
	<slot />
</Content>
