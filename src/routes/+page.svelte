<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, InlineLoading, Link, ListItem, UnorderedList } from 'carbon-components-svelte';
	import { Add } from 'carbon-icons-svelte';
	import { recentBoxes } from '../lib/recentBoxes';
	import { buildPath } from '$lib/files/common';

	let loading = false;

	async function createBox() {
		loading = true;
		const result = await (
			await fetch('/api/box/create', {
				method: 'POST'
			})
		).json();
		loading = false;
		goto(buildPath(result.boxId, []));
	}
</script>

<svelte:head>
	<title>DropDrop</title>
</svelte:head>

<div class="content">
	<div class="centered">
		<img src="/logo.png" alt="DropDrop logo" width="64" />
		<h1>DropDrop</h1>
		<p>
			DropDrop is a service to quickly create "boxes" that allow everybody with the box address to
			upload and download files.<br />
			<span class="copyright"
				>Built by <a href="https://alvaro.galisteo.me">Álvaro Galisteo</a></span
			>
		</p>
		{#if !loading}
			<Button icon={Add} on:click={createBox}>Create a box</Button>
		{:else}
			<InlineLoading description="Creating box..." />
		{/if}

		{#if $recentBoxes.length > 0}
			<div class="recentBoxes">
				<h2>Recent boxes</h2>
				<UnorderedList>
					{#each $recentBoxes as box}
						<ListItem><Link href={`/box/${box}`}>{box}</Link></ListItem>
					{/each}
				</UnorderedList>
			</div>
		{/if}
	</div>
</div>

<style>
	.content {
		display: flex;
		align-items: center;
		height: 100%;
		max-width: 800px;
	}

	h1 {
		font-size: 4rem;
		margin-top: 20px;
	}

	p {
		font-size: 1.3rem;
		margin-bottom: 20px;
	}

	.copyright {
		font-size: 1rem;
		opacity: 0.8;
	}

	.recentBoxes {
		margin-top: 30px;
	}

	@media screen and (max-width: 600px) {
		.content .centered {
			padding-left: 2rem;
			padding-right: 2rem;
		}
	}
</style>
