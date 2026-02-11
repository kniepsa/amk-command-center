<script lang="ts">
	type Props = {
		title: string;
		icon: string;
		isOpen?: boolean;
		onToggle?: (open: boolean) => void;
		variant?: 'default' | 'primary' | 'secondary';
		children?: any;
	};

	let { title, icon, isOpen = false, onToggle, variant = 'default', children }: Props = $props();

	let open = $state(isOpen);

	// Sync with parent prop changes
	$effect(() => {
		open = isOpen;
	});

	function toggle() {
		open = !open;
		onToggle?.(open);
	}

	const variantStyles = {
		default: 'bg-white border-slate-200',
		primary: 'bg-blue-50 border-blue-200',
		secondary: 'bg-slate-50 border-slate-300'
	};
</script>

<div class="border rounded-xl overflow-hidden {variantStyles[variant]}">
	<!-- Header (always visible) -->
	<button
		onclick={toggle}
		class="w-full px-6 py-4 flex items-center justify-between hover:bg-opacity-80 transition-colors"
	>
		<div class="flex items-center gap-3">
			<span class="text-2xl">{icon}</span>
			<h3 class="text-lg font-semibold text-slate-900">{title}</h3>
		</div>
		<span class="text-slate-600 transition-transform duration-200 {open ? 'rotate-180' : ''}">
			▼
		</span>
	</button>

	<!-- Content (collapsible) -->
	{#if open}
		<div class="px-6 pb-6 border-t border-slate-200">
			{@render children()}
		</div>
	{/if}
</div>
