<script lang="ts">
	import { goto } from '$app/navigation';
	import { buildPath, openCreateFolderModal } from '$lib/files';
	import type { File } from '$lib/types';
	import { Modal, TextInput } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let boxId: string;
	export let path: string[];
	export let files: File[];
	let data = {
		name: ''
	};
	let state = {
		invalid: false,
		invalidText: ''
	};

	function close() {
		openCreateFolderModal.set(false);
	}

	async function submit() {
		if (data.name.includes('/')) {
			state.invalid = true;
			state.invalidText = "Folder name must not contain '/'";
			return;
		}

		if (files.find((f) => f.name == data.name)) {
			state.invalid = true;
			state.invalidText = 'A folder or file with that name already exists';
			return;
		}

        let result;
        try {
            console.log(`${path}/${data.name}`);
            result = await (await fetch(buildPath(boxId, path, data.name), {
                method: 'POST'
            })).json();
        } catch(err) {
            state.invalid = true;
			state.invalidText = 'An error has occurred while creating the folder';
			return;
        }

		dispatch('submit', <File>{
			type: 'file',
			id: files.length == 0 ? 0 : files[files.length - 1].id + 1,
			path: [...path, data.name],
			name: data.name,
			mime: { mime: 'dir', name: 'Directory', type: 'dir' },
			size: 0
		});

		// Reset to initial values
		data = {
			name: ''
		};
		state = {
			invalid: false,
			invalidText: ''
		};
		close();
        goto(result.path);
	}

	console.log('CreateFolderPopup', path);
</script>

<Modal
	bind:open={$openCreateFolderModal}
	modalHeading="Create folder"
	primaryButtonText="Create"
	secondaryButtonText="Cancel"
	selectorPrimaryFocus="#db-name"
	on:click:button--secondary={close}
	on:submit={() => {
		console.log('Clicked submit');
		submit();
	}}
>
	<p>Create a new Folder database in <code>{boxId}/{path.join('/')}</code></p>
	<br />
	<TextInput
		invalid={state.invalid}
		invalidText={state.invalidText}
		labelText="Folder name"
		bind:value={data.name}
	/>
</Modal>

<style>
	p {
		padding-right: 0;
	}
</style>
