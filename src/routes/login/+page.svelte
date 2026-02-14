<script lang="ts">
	import { goto } from '$app/navigation';

	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			// Use HTTP Basic Auth to authenticate
			const response = await fetch('/', {
				headers: {
					Authorization: `Basic ${btoa(`user:${password}`)}`
				}
			});

			if (response.ok) {
				// Session cookie was set by server, redirect to home
				goto('/');
			} else {
				error = 'Invalid password';
			}
		} catch (err) {
			error = 'Authentication failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-cloud-50 flex items-center justify-center">
	<div class="w-96 bg-white shadow-lg rounded-lg border border-cloud-200">
		<div class="p-8">
			<h2 class="text-2xl font-semibold text-cloud-600 mb-2">Command Center</h2>
			<p class="text-cloud-500 mb-6">Enter password to access your personal dashboard</p>

			<form onsubmit={handleLogin}>
				<div class="mb-4">
					<label class="block text-sm font-medium text-cloud-600 mb-2" for="password">
						Password
					</label>
					<input
						id="password"
						type="password"
						placeholder="Enter password"
						class="w-full px-4 py-2 border border-cloud-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
						bind:value={password}
						required
						autofocus
					/>
				</div>

				{#if error}
					<div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full bg-accent-500 hover:bg-accent-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={loading}
				>
					{loading ? 'Authenticating...' : 'Sign In'}
				</button>
			</form>

			<div class="text-sm text-cloud-500 mt-6">
				<p>Default password: <code class="bg-cloud-100 text-cloud-600 px-2 py-1 rounded">changeme</code></p>
			</div>
		</div>
	</div>
</div>
