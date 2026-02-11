<script lang="ts">
	type Props = {
		variant?: 'default' | 'elevated' | 'bordered';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children?: any;
	};

	let { variant = 'default', padding = 'md', children }: Props = $props();

	const variantStyles = {
		default: 'bg-white rounded-lg',
		elevated: 'bg-white rounded-xl shadow-lg',
		bordered: 'bg-white rounded-lg border border-slate-200'
	};

	const paddingStyles = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div class="{variantStyles[variant]} {paddingStyles[padding]}">
	{@render children()}
</div>
