<script lang="ts">
	import 'carbon-components-svelte/css/all.css';
	import '../styles.css';
	import { Content, Header, HeaderNav, HeaderNavItem, HeaderNavMenu, SkipToContent } from 'carbon-components-svelte';

	let theme = 'white'; // "white" | "g10" | "g80" | "g90" | "g100"
</script>

<Header company="DropDrop" href="/">
    <svelte:fragment slot="skip-to-content">
      <SkipToContent />
    </svelte:fragment>
  </Header>

<Content>
	<slot />
</Content>
