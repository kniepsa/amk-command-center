<script lang="ts">
	type Props = {
		type?: 'text' | 'time' | 'number' | 'email';
		value: string | number;
		placeholder?: string;
		label?: string;
		disabled?: boolean;
		fullWidth?: boolean;
		oninput?: (value: string) => void;
	};

	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		label,
		disabled = false,
		fullWidth = false,
		oninput
	}: Props = $props();

	// Generate unique ID for accessibility
	const inputId = `input-${Math.random().toString(36).slice(2, 11)}`;
</script>

<div class="{fullWidth ? 'w-full' : ''}">
	{#if label}
		<label for={inputId} class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
	{/if}
	<input
		id={inputId}
		{type}
		bind:value
		{placeholder}
		{disabled}
		oninput={(e) => oninput?.(e.currentTarget.value)}
		class="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed {fullWidth
			? 'w-full'
			: ''}"
	/>
</div>
