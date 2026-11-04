const test = require('node:test');
const assert = require('node:assert/strict');
const { createRequireAuth, requireRole } = require('../src/middleware/auth');

function createResponse() {
	return {
		statusCode: null,
		body: null,
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(body) {
			this.body = body;
			return this;
		}
	};
}

function createRequest(token) {
	return {
		get(name) {
			return name === 'authorization' ? token : undefined;
		}
	};
}

function createClient(user, error = null) {
	return {
		auth: {
			async getUser(token) {
				return { data: { user }, error, token };
			}
		}
	};
}

test('verifies bearer tokens and attaches the server-controlled profile', async () => {
	const middleware = createRequireAuth(createClient({
		id: 'user-id',
		email: 'coordinator@example.test',
		app_metadata: { role: 'coordenador' }
	}));
	const req = createRequest('Bearer valid-token');
	const res = createResponse();
	let calledNext = false;

	await middleware(req, res, () => { calledNext = true; });
	assert.equal(calledNext, true);
	assert.deepEqual(req.authUser, {
		id: 'user-id',
		email: 'coordinator@example.test',
		perfil: 'coordenador',
		docenteId: null
	});
});

test('rejects missing and invalid bearer tokens', async () => {
	const missingResponse = createResponse();
	await createRequireAuth(createClient({ id: 'user-id', app_metadata: { perfil: 'secretaria' } }))(
		createRequest(undefined),
		missingResponse,
		() => assert.fail('next should not be called')
	);
	assert.equal(missingResponse.statusCode, 401);

	const invalidResponse = createResponse();
	await createRequireAuth(createClient(null, new Error('invalid token')))(
		createRequest('Bearer bad-token'),
		invalidResponse,
		() => assert.fail('next should not be called')
	);
	assert.equal(invalidResponse.statusCode, 401);
});

test('rejects profiles not configured by an administrator', async () => {
	const response = createResponse();
	await createRequireAuth(createClient({
		id: 'user-id',
		user_metadata: { perfil: 'coordenador' },
		app_metadata: {}
	}))(createRequest('Bearer valid-token'), response, () => assert.fail('next should not be called'));
	assert.equal(response.statusCode, 403);
});

test('requires a valid docente_id for teacher accounts', async () => {
	const response = createResponse();
	await createRequireAuth(createClient({
		id: 'teacher-id',
		app_metadata: { perfil: 'docente', docente_id: 'not-an-id' }
	}))(createRequest('Bearer valid-token'), response, () => assert.fail('next should not be called'));
	assert.equal(response.statusCode, 403);
});

test('enforces route roles independently from the frontend', () => {
	const response = createResponse();
	let nextCalled = false;
	requireRole('coordenador')({ authUser: { perfil: 'docente' } }, response, () => { nextCalled = true; });
	assert.equal(response.statusCode, 403);
	assert.equal(nextCalled, false);

	requireRole('coordenador')({ authUser: { perfil: 'coordenador' } }, createResponse(), () => { nextCalled = true; });
	assert.equal(nextCalled, true);
});
