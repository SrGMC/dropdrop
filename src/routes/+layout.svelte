<script lang="ts">
	import 'carbon-components-svelte/css/all.css';
	import '../styles.css';
	import { Content, Header, HeaderActionLink, HeaderGlobalAction, HeaderUtilities, SkipToContent } from 'carbon-components-svelte';
	import { LogoGithub, SettingsAdjust } from 'carbon-icons-svelte';

	let theme = 'white'; // "white" | "g10" | "g80" | "g90" | "g100"
</script>

<Header platformName="DropDrop" href="/">
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>
	<HeaderUtilities>
		<HeaderActionLink aria-label="Settings" icon={LogoGithub} href="https://github.com/SrGMC/dropdrop" />
	</HeaderUtilities>
</Header>

<Content>
	<slot />
</Content>
