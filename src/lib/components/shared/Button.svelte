<script lang="ts">
	type Props = {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		fullWidth?: boolean;
		onclick?: () => void;
		type?: 'button' | 'submit' | 'reset';
		children?: any;
	};

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		fullWidth = false,
		onclick,
		type = 'button',
		children
	}: Props = $props();

	const variantStyles = {
		primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300',
		secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-100',
		ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:bg-transparent',
		danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-300'
	};

	const sizeStyles = {
		sm: 'px-3 py-2 min-h-[44px] text-sm',
		md: 'px-4 py-2.5 min-h-[44px] text-base',
		lg: 'px-6 py-3 min-h-[48px] text-lg'
	};
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="rounded-lg font-medium transition-colors disabled:cursor-not-allowed {variantStyles[
		variant
	]} {sizeStyles[size]} {fullWidth ? 'w-full' : ''}"
>
	{@render children()}
</button>
