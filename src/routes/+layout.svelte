<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import PersistenceManager from '$lib/components/PersistenceManager.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>AMK Command Center</title>
</svelte:head>

<!-- Persistence manager handles localStorage sync -->
<PersistenceManager />

{@render children()}
