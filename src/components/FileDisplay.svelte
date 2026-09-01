<script lang="ts">
	import { page } from '$app/stores';
	import { Button, InlineLoading } from 'carbon-components-svelte';
	import { Download } from 'carbon-icons-svelte';
	import { marked } from 'marked';
	import { onMount } from 'svelte';

	export let name: string;

	type PreviewMode = 'image' | 'text' | 'markdown' | 'pdf' | 'download';

	// The page URL path doubles as the raw-file URL: <img>, <embed>, and fetch()
	// all bypass the page route (no text/html in Accept) and hit +server.ts GET.
	const fileUrl = $page.url.pathname;

	function getPreviewMode(filename: string): PreviewMode {
		const ext = filename.split('.').pop()?.toLowerCase() ?? '';
		if (['png', 'jpg', 'jpeg', 'heic', 'heif', 'raw'].includes(ext)) return 'image';
		if (ext === 'txt') return 'text';
		if (ext === 'md') return 'markdown';
		if (ext === 'pdf') return 'pdf';
		return 'download';
	}

	const previewMode: PreviewMode = getPreviewMode(name);

	let textContent = '';
	let markdownHtml = '';
	let downloading = false;

	onMount(async () => {
		if (previewMode === 'download') {
			await triggerDownload();
			return;
		}
		if (previewMode === 'text') {
			try {
				const res = await fetch(fileUrl);
				textContent = await res.text();
			} catch {
				textContent = 'Could not load file content.';
			}
		} else if (previewMode === 'markdown') {
			try {
				const DOMPurify = (await import('dompurify')).default;
				const res = await fetch(fileUrl);
				const text = await res.text();
				markdownHtml = DOMPurify.sanitize(marked.parse(text) as string);
			} catch {
				markdownHtml = '<p>Could not render markdown.</p>';
			}
		}
	});

	// Download the file via fetch → Blob → programmatic anchor click so that we
	// stream through the server endpoint rather than embedding the content in the
	// page payload.
	async function triggerDownload() {
		downloading = true;
		try {
			const res = await fetch(`${fileUrl}?download=true`);
			const blob = await res.blob();
			const blobUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(blobUrl);
		} finally {
			downloading = false;
		}
	}
</script>

{#if previewMode === 'download'}
	<div class="centered-view">
		<div class="centered-content">
			<Download size={32} />
			<h1>{name}</h1>
			<p>This file type cannot be previewed.</p>
			<div class="download-actions">
				{#if downloading}
					<InlineLoading description="Downloading…" />
				{:else}
					<Button size="lg" icon={Download} on:click={triggerDownload}>Download</Button>
				{/if}
			</div>
		</div>
	</div>
{:else if previewMode === 'image'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			{#if downloading}
				<InlineLoading description="Downloading…" />
			{:else}
				<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
			{/if}
		</div>
		<div class="preview-body image-preview">
			<img src={fileUrl} alt={name} />
		</div>
	</div>
{:else if previewMode === 'text'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			{#if downloading}
				<InlineLoading description="Downloading…" />
			{:else}
				<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
			{/if}
		</div>
		<div class="preview-body text-preview">
			<pre>{textContent}</pre>
		</div>
	</div>
{:else if previewMode === 'markdown'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			{#if downloading}
				<InlineLoading description="Downloading…" />
			{:else}
				<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
			{/if}
		</div>
		<div class="preview-body markdown-preview">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html markdownHtml}
		</div>
	</div>
{:else if previewMode === 'pdf'}
	<div class="preview-container">
		<div class="preview-header">
			<span class="filename">{name}</span>
			{#if downloading}
				<InlineLoading description="Downloading…" />
			{:else}
				<Button size="sm" icon={Download} on:click={triggerDownload}>Download</Button>
			{/if}
		</div>
		<div class="preview-body pdf-preview">
			<embed src={fileUrl} type="application/pdf" width="100%" height="100%" />
		</div>
	</div>
{/if}

<style>
	/* Centered view for un-previewable files */
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

	.download-actions {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
	}

	p {
		margin: 10px 0;
	}

	/* Full-viewport preview panel below the Carbon header (48px / 3rem) */
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

	/* Sticky sub-header inside the panel — flex item, not separately fixed */
	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 1rem;
		height: 3rem;
		border-bottom: 1px solid var(--cds-ui-03, #e0e0e0);
		background: var(--cds-ui-01, #f4f4f4);
		flex-shrink: 0;
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

	/* Markdown preview */
	.markdown-preview {
		background: var(--cds-ui-background, #fff);
		padding: 2rem;
		max-width: 860px;
		margin: 0 auto;
		box-sizing: border-box;
		width: 100%;
	}
</style>
