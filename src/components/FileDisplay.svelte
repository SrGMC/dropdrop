<script lang="ts">
	import { page } from '$app/stores';
	import { downloadBase64AsFile } from '$lib/files/browser';
	import { ProgressBar } from 'carbon-components-svelte';
	import { Download } from 'carbon-icons-svelte';
	import { onMount } from 'svelte';

	export let base64: string;
	export let name: string;

	let downloadStatus: 'active' | 'finished' = 'active';

	onMount(() => {
		downloadStatus = 'active';
		downloadBase64AsFile(<string>base64, name);
		downloadStatus = 'finished';
		if ($page.url.searchParams.has('download')) {
			setTimeout(() => {
				window.close();
			}, 500);
		}
	});
</script>

<div class="content">
	<div>
		<Download size={32} />
		<h1>Downloading</h1>
		<ProgressBar status={downloadStatus} labelText={`Downloading ${name}`} />
		<!-- svelte-ignore a11y-invalid-attribute -->
		<!-- <p>
            If the download does not finish,
            <a href="javascript:window.location.reload()">click here to try again</a>.
        </p> -->
		<!-- svelte-ignore a11y-invalid-attribute -->
		<p class="close"><a href="javascript:window.close();">Close tab</a></p>
	</div>
</div>

<style>
	.content {
		display: flex;
		align-items: center;
		height: 100%;
		width: 100%;
		max-width: 800px;
	}

	.content div {
		width: 100%;
	}

	.content h1 {
		margin-bottom: 15px;
	}

	p {
		margin: 10px 0;
	}

	p.close a {
		color: var(--cds-danger-01, #da1e28);
	}
</style>
