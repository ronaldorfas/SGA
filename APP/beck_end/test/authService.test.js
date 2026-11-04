const test = require('node:test');
const assert = require('node:assert/strict');
const { createAuthService, getProfile } = require('../src/services/authServiceFactory');

function createClient({ session, user, error } = {}) {
	const calls = [];
	return {
		calls,
		auth: {
			async signInWithPassword(credentials) {
				calls.push({ method: 'signInWithPassword', credentials });
				return { data: { session, user }, error };
			},
			async refreshSession(credentials) {
				calls.push({ method: 'refreshSession', credentials });
				return { data: { session, user }, error };
			}
		}
	};
}

const session = {
	access_token: 'access-token',
	refresh_token: 'refresh-token',
	token_type: 'bearer',
	expires_in: 3600,
	expires_at: 1234567890
};

test('authenticates with Supabase Auth and returns only approved profile data', async () => {
	const client = createClient({
		session,
		user: {
			id: 'user-id',
			email: 'teacher@example.test',
			app_metadata: { perfil: 'docente', docente_id: 42 }
		}
	});
	const service = createAuthService(client);

	assert.deepEqual(await service.signIn({ email: ' Teacher@Example.Test ', password: 'secret' }), {
		...session,
		user: {
			id: 'user-id',
			email: 'teacher@example.test',
			perfil: 'docente',
			docente_id: 42
		}
	});
	assert.deepEqual(client.calls[0], {
		method: 'signInWithPassword',
		credentials: { email: 'teacher@example.test', password: 'secret' }
	});
});

test('does not trust profile stored in user-editable metadata', async () => {
	const client = createClient({
		session,
		user: {
			id: 'user-id',
			email: 'forged@example.test',
			user_metadata: { perfil: 'coordenador' },
			app_metadata: {}
		}
	});

	await assert.rejects(createAuthService(client).signIn({
		email: 'forged@example.test',
		password: 'secret'
	}), { statusCode: 403 });
	assert.equal(getProfile({
		user_metadata: { perfil: 'coordenador' },
		app_metadata: {}
	}), null);
});

test('requires a linked teacher record for the teacher role', async () => {
	const client = createClient({
		session,
		user: { id: 'user-id', app_metadata: { role: 'docente' } }
	});

	await assert.rejects(createAuthService(client).signIn({
		email: 'teacher@example.test',
		password: 'secret'
	}), { statusCode: 403 });
});

test('rejects invalid credentials without exposing provider details', async () => {
	const service = createAuthService(createClient({ error: new Error('provider detail') }));
	await assert.rejects(service.signIn({ email: 'user@example.test', password: 'bad' }), {
		statusCode: 401,
		message: 'E-mail ou senha inválidos.'
	});
});

test('validates required credentials and missing server configuration', async () => {
	await assert.rejects(createAuthService(null).signIn({}), { statusCode: 503 });
	await assert.rejects(createAuthService(createClient()).signIn({ email: '', password: '' }), { statusCode: 400 });
});

test('refreshes a session and rejects missing refresh tokens', async () => {
	const client = createClient({
		session,
		user: {
			id: 'user-id',
			email: 'coordinator@example.test',
			app_metadata: { role: 'coordenador' }
		}
	});
	const service = createAuthService(client);

	const result = await service.refresh({ refresh_token: 'old-refresh-token' });
	assert.equal(result.user.perfil, 'coordenador');
	assert.deepEqual(client.calls[0], {
		method: 'refreshSession',
		credentials: { refresh_token: 'old-refresh-token' }
	});
	await assert.rejects(service.refresh({}), { statusCode: 401 });
});
