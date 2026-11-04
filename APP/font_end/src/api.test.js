import { apiFetch } from './api';

const authSession = {
	access_token: 'current-access-token',
	refresh_token: 'current-refresh-token',
	user: { perfil: 'coordenador' }
};

beforeEach(() => {
	window.sessionStorage.clear();
	global.fetch = jest.fn();
});

afterEach(() => {
	jest.restoreAllMocks();
});

test('attaches the session bearer token to API requests', async () => {
	window.sessionStorage.setItem('sga-auth-session', JSON.stringify(authSession));
	global.fetch.mockResolvedValue({ status: 200 });

	await apiFetch('/api/turmas');

	const [, options] = global.fetch.mock.calls[0];
	expect(options.headers.get('Authorization')).toBe('Bearer current-access-token');
});

test('refreshes an expired session once and retries the protected request', async () => {
	window.sessionStorage.setItem('sga-auth-session', JSON.stringify(authSession));
	const renewedSession = {
		access_token: 'renewed-access-token',
		refresh_token: 'renewed-refresh-token',
		user: { perfil: 'coordenador' }
	};
	global.fetch
		.mockResolvedValueOnce({ status: 401 })
		.mockResolvedValueOnce({ ok: true, json: async () => renewedSession })
		.mockResolvedValueOnce({ status: 200 });

	const response = await apiFetch('/api/turmas');

	expect(response.status).toBe(200);
	expect(global.fetch).toHaveBeenCalledTimes(3);
	expect(global.fetch.mock.calls[1][0]).toBe('/api/auth/refresh');
	expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({ refresh_token: 'current-refresh-token' });
	expect(global.fetch.mock.calls[2][1].headers.get('Authorization')).toBe('Bearer renewed-access-token');
	expect(JSON.parse(window.sessionStorage.getItem('sga-auth-session'))).toEqual(renewedSession);
});

test('does not attach a prior token to the login request', async () => {
	window.sessionStorage.setItem('sga-auth-session', JSON.stringify(authSession));
	global.fetch.mockResolvedValue({ status: 200 });

	await apiFetch('/api/auth/login', { method: 'POST' });

	const [, options] = global.fetch.mock.calls[0];
	expect(options.headers.has('Authorization')).toBe(false);
});
