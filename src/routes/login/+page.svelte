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

<div class="min-h-screen bg-base-200 flex items-center justify-center">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<h2 class="card-title text-2xl mb-4">Command Center</h2>
			<p class="text-gray-600 mb-4">Enter password to access your personal dashboard</p>

			<form onsubmit={handleLogin}>
				<div class="form-control">
					<label class="label" for="password">
						<span class="label-text">Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="Enter password"
						class="input input-bordered"
						bind:value={password}
						required
						autofocus
					/>
				</div>

				{#if error}
					<div class="alert alert-error mt-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="card-actions justify-end mt-6">
					<button type="submit" class="btn btn-primary w-full" disabled={loading}>
						{loading ? 'Authenticating...' : 'Sign In'}
					</button>
				</div>
			</form>

			<div class="text-sm text-gray-500 mt-4">
				<p>Default password: <code class="bg-base-200 px-2 py-1 rounded">changeme</code></p>
			</div>
		</div>
	</div>
</div>
