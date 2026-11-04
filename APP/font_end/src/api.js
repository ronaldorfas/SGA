const apiBaseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const sessionKey = 'sga-auth-session';
let refreshInProgress = null;

function readSession() {
	try {
		return JSON.parse(window.sessionStorage.getItem(sessionKey) || 'null');
	} catch {
		window.sessionStorage.removeItem(sessionKey);
		return null;
	}
}

async function refreshSession() {
	if (refreshInProgress) return refreshInProgress;

	const session = readSession();
	if (!session?.refresh_token) return null;

	refreshInProgress = (async () => {
		try {
			const response = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh_token: session.refresh_token })
			});
			const result = await response.json();
			if (!response.ok || !result.access_token || !result.refresh_token || !result.user?.perfil) {
				window.sessionStorage.removeItem(sessionKey);
				return null;
			}
			window.sessionStorage.setItem(sessionKey, JSON.stringify(result));
			return result;
		} catch {
			return null;
		} finally {
			refreshInProgress = null;
		}
	})();

	return refreshInProgress;
}

function createRequestOptions(options, session) {
	const headers = new Headers(options?.headers || {});
	if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
	return { ...options, headers };
}

export async function apiFetch(path, options = {}) {
	const authPath = path === '/api/auth/login' || path === '/api/auth/refresh';
	const session = authPath ? null : readSession();
	let response = await fetch(`${apiBaseUrl}${path}`, createRequestOptions(options, session));

	if (response.status === 401 && session?.refresh_token && !authPath) {
		const refreshedSession = await refreshSession();
		if (refreshedSession) {
			response = await fetch(`${apiBaseUrl}${path}`, createRequestOptions(options, refreshedSession));
		}
	}
	return response;
}
