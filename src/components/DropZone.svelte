<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let dragged = false;
	let dragTimeout: NodeJS.Timeout;

	function handleDragOver(event: HTMLBodyElementEventMap['dragover']) {
		event.preventDefault();

		dragged = true;
		clearTimeout(dragTimeout);
		dragTimeout = setTimeout(() => {
			dragged = false;
		}, 100);
	}

	function handleDrop(event: any) {
		console.log('File(s) dropped');

		// Prevent default behavior (Prevent file from being opened)
		event.preventDefault();

		let files: any[] = [];

		if (event.dataTransfer.items) {
			// Use DataTransferItemList interface to access the file(s)
			[...event.dataTransfer.items].forEach((item, i) => {
				// If dropped items aren't files, reject them
				if (item.kind === 'file') {
					const file = item.getAsFile();
					files.push(file);
				}
			});
		} else {
			// Use DataTransfer interface to access the file(s)
			[...event.dataTransfer.files].forEach((file, i) => {
				files.push(file);
				console.log(`… file[${i}].name = ${file.name}`);
			});
		}

		dispatch('drop', files);
	}

	onMount(() => {
		document.querySelector('body')?.addEventListener('dragover', handleDragOver);
	});

	// onDestroy(() => {
	// 	document.querySelector('body')?.removeEventListener('dragover', handleDragOver);
	// });
</script>

<div class="dropzone" class:dragged on:drop={handleDrop}>
	<div class="drop">
		<p>Drag and drop files here</p>
	</div>
</div>

<style>
	.dropzone {
		position: fixed;
		z-index: 10000;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(206, 212, 218, 0.5);

		display: none;
		align-items: center;
		justify-content: center;
	}

	.dropzone.dragged {
		display: flex;
	}

	.drop {
		margin: 50px;
		border: 3px dashed #495057;
		width: 100%;
		height: calc(100% - 100px);

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.drop p {
		font-size: 2rem;
	}
</style>
