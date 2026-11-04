const sessionStorageKey = 'sga-auth-session';

export function getAuthSession() {
	try {
		const rawSession = window.sessionStorage.getItem(sessionStorageKey);
		if (!rawSession) return null;

		const session = JSON.parse(rawSession);
		if (!session?.access_token || !session?.refresh_token || !session?.user?.perfil) {
			window.sessionStorage.removeItem(sessionStorageKey);
			return null;
		}
		return session;
	} catch {
		window.sessionStorage.removeItem(sessionStorageKey);
		return null;
	}
}

export function setAuthSession(session) {
	if (!session?.access_token || !session?.refresh_token || !session?.user?.perfil) {
		throw new Error('A resposta de autenticação não contém uma sessão válida.');
	}
	window.sessionStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

export function clearAuthSession() {
	window.sessionStorage.removeItem(sessionStorageKey);
}
