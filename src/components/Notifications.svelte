<script lang="ts">
	import { errors } from '$lib/files/browser';
	import { InlineNotification } from 'carbon-components-svelte';
</script>

<div class="notifications">
	{#each $errors as error}
		<InlineNotification
			lowContrast
			kind="error"
			title={`${error.name}:`}
			subtitle={error.type == 'size'
				? 'File must be 100MB in size or lower.'
				: 'An error occurred while uploading the file. Please, try again later.'}
			timeout={5000}
			hideCloseButton={true}
			on:close={() => {
				let list = JSON.parse(JSON.stringify($errors));
				list.splice($errors.indexOf(error), 1);
				errors.set(list);
			}}
		/>
	{/each}
</div>

<style>
	.notifications {
		position: fixed;
		bottom: 15px;
		right: 15px;
	}
</style>
