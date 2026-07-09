<script lang="ts">
	import { page } from '$app/stores';
	import { downloadBase64AsFile } from '$lib/files/browser';
	import { Button, ProgressBar } from 'carbon-components-svelte';
	import { Download } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	export let base64: string;
	export let name: string;

	type PreviewMode = 'image' | 'text' | 'pdf' | 'unsupported' | 'download';

	function getPreviewMode(filename: string): PreviewMode {
		const ext = filename.split('.').pop()?.toLowerCase() ?? '';
		if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image';
		if (ext === 'txt') return 'text';
		if (ext === 'pdf') return 'pdf';
		if (['heic', 'raw', 'arw', 'cr2', 'nef', 'dng'].includes(ext)) return 'unsupported';
		return 'download';
	}

	function getMimeType(filename: string): string {
		const ext = filename.split('.').pop()?.toLowerCase() ?? '';
		if (ext === 'png') return 'image/png';
		if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
		if (ext === 'pdf') return 'application/pdf';
		return 'application/octet-stream';
	}

	const forceDownload = $page.url.searchParams.has('download');
	const previewMode: PreviewMode = forceDownload ? 'download' : getPreviewMode(name);

	let downloadStatus: 'active' | 'finished' = 'active';
	let textContent = '';

	onMount(() => {
		if (previewMode === 'download') {
			downloadStatus = 'active';
			downloadBase64AsFile(base64, name);
			downloadStatus = 'finished';
			if ($page.url.searchParams.has('download')) {
				setTimeout(() => {
					window.close();
				}, 500);
			}
		} else if (previewMode === 'text') {
			try {
				textContent = atob(base64);
			} catch {
				textContent = 'Could not decode file content.';
			}
		}
	});

	function triggerDownload() {
		downloadBase64AsFile(base64, name);
	}

	$: dataUri = `data:${getMimeType(name)};base64,${base64}`;
</script>

{#if previewMode === 'download'}
	<div class="centered-view">
		<div class="centered-content">
			<Download size={32} />
			<h1>Downloading</h1>
			<ProgressBar status={downloadStatus} labelText={`Downloading ${name}`} />
			<!-- svelte-ignore a11y-invalid-attribute -->
			<p class="close"><a href="javascript:window.close();">Close tab</a></p>
		</div>
	</div>
{:else if previewMode === 'image'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
		</div>
		<div class="preview-body image-preview">
			<img src={dataUri} alt={name} />
		</div>
	</div>
{:else if previewMode === 'text'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
		</div>
		<div class="preview-body text-preview">
			<pre>{textContent}</pre>
		</div>
	</div>
{:else if previewMode === 'pdf'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
		</div>
		<div class="preview-body pdf-preview">
			<embed src={dataUri} type="application/pdf" width="100%" height="100%" />
		</div>
	</div>
{:else if previewMode === 'unsupported'}
	<div class="centered-view">
		<div class="centered-content">
			<Download size={32} />
			<h1>{name}</h1>
			<p>Preview is not supported for this file type in the browser.</p>
			<Button size="lg" icon={Download} on:click={triggerDownload}>Download file</Button>
			<!-- svelte-ignore a11y-invalid-attribute -->
			<p class="close"><a href="javascript:window.close();">Close tab</a></p>
		</div>
	</div>
{/if}

<style>
	/* Centered views (download / unsupported) */
	.centered-view {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}

	.centered-content {
		width: 100%;
		max-width: 800px;
	}

	.centered-content h1 {
		margin-bottom: 15px;
	}

	p {
		margin: 10px 0;
	}

	p.close a {
		color: var(--cds-danger-01, #da1e28);
	}

	/* Preview layout — full viewport below Carbon header (3rem / 48px) */
	.preview-container {
		position: fixed;
		top: 3rem;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		z-index: 1;
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem;
		height: 3rem;
		border-bottom: 1px solid var(--cds-ui-03, #e0e0e0);
		background: var(--cds-ui-01, #f4f4f4);
		flex-shrink: 0;
		width: 100%;
		box-sizing: border-box;
		position: fixed;
		top: 48px; /* Adjust for Carbon header height */
		left: 0;
		right: 0;
	}

	.filename {
		font-weight: 600;
		font-size: 0.95rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: 1rem;
	}

	.preview-body {
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	/* Image preview */
	.image-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--cds-ui-background, #fff);
		padding: 1rem;
		box-sizing: border-box;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	/* Text preview */
	.text-preview {
		background: var(--cds-ui-background, #fff);
	}

	.text-preview pre {
		margin: 0;
		padding: 1rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.875rem;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* PDF preview */
	.pdf-preview {
		display: flex;
	}

	.pdf-preview embed {
		flex: 1;
		border: none;
	}
</style>
