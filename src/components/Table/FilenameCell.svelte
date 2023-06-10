<script lang="ts">
	import { browser } from '$app/environment';
	import { buildPath } from '$lib/files/common';
	import type { MimeType } from '$lib/types';
	import {
		DocumentBlank,
		Music,
		TextFont,
		Video,
		Book,
		DocumentPdf,
		PresentationFile,
		TableSplit,
		Archive,
		Folder,
		Image,
		Document
	} from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	export let boxId: string;
	export let path: string[];
	export let name: string;
	export let mime: MimeType;

	let link: HTMLAnchorElement;
	let innerWidth: number;

	$: clientWidth = innerWidth * 0.55;
	$: fittedName = fitStringToWidth(name, clientWidth);
	// $: console.log(name, fittedName, clientWidth);

	function fitStringToWidth(str: string, width: number, className?: string) {
		// str    A string where html-entities are allowed but no tags.
		// width  The maximum allowed width in pixels
		// className  A CSS class name with the desired font-name and font-size. (optional)
		// ----
		// _escTag is a helper to escape 'less than' and 'greater than'
		function _escTag(s: string) {
			return s.replace('<', '&lt;').replace('>', '&gt;');
		}

		if(!browser) {
			return str;
		}

		//Create a span element that will be used to get the width
		var span = document.createElement('span');
		//Allow a classname to be set to get the right font-size.
		if (className) span.className = className;
		span.style.display = 'inline';
		span.style.visibility = 'hidden';
		span.style.padding = '0px';
		document.body.appendChild(span);

		var result = _escTag(str); // default to the whole string
		span.innerHTML = result;
		// Check if the string will fit in the allowed width. NOTE: if the width
		// can't be determined (offsetWidth==0) the whole string will be returned.
		if (span.offsetWidth > width) {
			var posStart = 0,
				posMid,
				posEnd = str.length,
				posLength;
			// Calculate (posEnd - posStart) integer division by 2 and
			// assign it to posLength. Repeat until posLength is zero.
			while ((posLength = (posEnd - posStart) >> 1)) {
				posMid = posStart + posLength;
				//Get the string from the beginning up to posMid;
				span.innerHTML = _escTag(str.substring(0, posMid)) + '&hellip;';

				// Check if the current width is too wide (set new end)
				// or too narrow (set new start)
				if (span.offsetWidth > width) posEnd = posMid;
				else posStart = posMid;
			}

			result =
				'<abbr title="' +
				str.replace('"', '&quot;') +
				'">' +
				_escTag(str.substring(0, posStart)) +
				'&hellip;</abbr>';
		}
		document.body.removeChild(span);
		return result;
	}

	onMount(() => {
		innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		window.addEventListener('resize', () => {
			innerWidth = screen && screen.width ? screen.width : window.innerWidth;
		});
	});
</script>

<a
	href={buildPath(boxId, path, name)}
	class="bx--link"
	target={mime.type == 'dir' ? '_self' : '_blank'}
	data-sveltekit-reload
	bind:this={link}
>
	{#if mime.type == 'application'}
		<DocumentBlank /> {@html fittedName}
	{:else if mime.type == 'audio'}
		<Music /> {@html fittedName}
	{:else if mime.type == 'font'}
		<TextFont /> {@html fittedName}
	{:else if mime.type == 'image'}
		<Image /> {@html fittedName}
	{:else if mime.type == 'text'}
		<Document /> {@html fittedName}
	{:else if mime.type == 'video'}
		<Video /> {@html fittedName}
	{:else if mime.type == 'epub'}
		<Book /> {@html fittedName}
	{:else if mime.type == 'pdf'}
		<DocumentPdf /> {@html fittedName}
	{:else if mime.type == 'powerpoint'}
		<PresentationFile /> {@html fittedName}
	{:else if mime.type == 'excel'}
		<TableSplit /> {@html fittedName}
	{:else if mime.type == 'word'}
		<Document /> {@html fittedName}
	{:else if mime.type == 'archive'}
		<Archive /> {@html fittedName}
	{:else if mime.type == 'dir'}
		<Folder /> {@html fittedName}
	{:else}
		<DocumentBlank /> {@html fittedName}
	{/if}
</a>
