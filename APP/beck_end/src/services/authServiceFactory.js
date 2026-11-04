const allowedProfiles = new Set(['docente', 'coordenador', 'secretaria', 'manutencao']);

function getProfile(user) {
	const profile = user?.app_metadata?.perfil || user?.app_metadata?.role;
	return allowedProfiles.has(profile) ? profile : null;
}

function publicSession(session) {
	const profile = getProfile(session?.user);
	if (!session?.access_token || !session?.refresh_token || !profile) {
		const error = new Error('A conta não possui um perfil autorizado no sistema.');
		error.statusCode = 403;
		throw error;
	}
	const docenteId = Number(session.user.app_metadata?.docente_id);
	if (profile === 'docente' && (!Number.isSafeInteger(docenteId) || docenteId <= 0)) {
		const error = new Error('A conta docente não está vinculada a um cadastro de docente.');
		error.statusCode = 403;
		throw error;
	}

	return {
		access_token: session.access_token,
		refresh_token: session.refresh_token,
		token_type: session.token_type,
		expires_in: session.expires_in,
		expires_at: session.expires_at,
		user: {
			id: session.user.id,
			email: session.user.email,
			perfil: profile,
			...(profile === 'docente' ? { docente_id: docenteId } : {})
		}
	};
}

function createAuthService(client) {
	async function signIn({ email, password } = {}) {
		if (!client) {
			const error = new Error('Autenticação não configurada.');
			error.statusCode = 503;
			throw error;
		}

		const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
		if (!cleanEmail || typeof password !== 'string' || !password) {
			const error = new Error('E-mail e senha são obrigatórios.');
			error.statusCode = 400;
			throw error;
		}

		const { data, error } = await client.auth.signInWithPassword({
			email: cleanEmail,
			password
		});
		if (error || !data.session || !data.user) {
			const authError = new Error('E-mail ou senha inválidos.');
			authError.statusCode = 401;
			throw authError;
		}

		return publicSession({ ...data.session, user: data.user });
	}

	async function refresh({ refresh_token: refreshToken } = {}) {
		if (!client) {
			const error = new Error('Autenticação não configurada.');
			error.statusCode = 503;
			throw error;
		}
		if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
			const error = new Error('Sessão ausente ou expirada. Entre novamente.');
			error.statusCode = 401;
			throw error;
		}

		const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
		if (error || !data.session || !data.user) {
			const authError = new Error('Sessão inválida ou expirada. Entre novamente.');
			authError.statusCode = 401;
			throw authError;
		}

		return publicSession({ ...data.session, user: data.user });
	}

	return { signIn, refresh };
}

module.exports = {
	allowedProfiles,
	createAuthService,
	getProfile
};
