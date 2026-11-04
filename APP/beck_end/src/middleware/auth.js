const { getProfile } = require('../services/authServiceFactory');

function createRequireAuth(client) {
	return async function requireAuth(req, res, next) {
		if (!client) {
			return res.status(503).json({ erro: 'Autenticação não configurada no servidor.' });
		}

		const authorization = req.get('authorization') || '';
		const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
		if (!match) {
			return res.status(401).json({ erro: 'Autenticação necessária.' });
		}

		const { data, error } = await client.auth.getUser(match[1]);
		if (error || !data?.user) {
			return res.status(401).json({ erro: 'Sessão inválida ou expirada. Entre novamente.' });
		}

		const perfil = getProfile(data.user);
		if (!perfil) {
			return res.status(403).json({ erro: 'A conta não possui um perfil autorizado no sistema.' });
		}

		req.authUser = {
			id: data.user.id,
			email: data.user.email,
			perfil,
			docenteId: perfil === 'docente' ? Number(data.user.app_metadata?.docente_id) : null
		};
		if (perfil === 'docente' && (!Number.isSafeInteger(req.authUser.docenteId) || req.authUser.docenteId <= 0)) {
			return res.status(403).json({ erro: 'A conta docente não está vinculada a um cadastro de docente.' });
		}
		return next();
	};
}

function requireRole(...profiles) {
	return function authorizeRole(req, res, next) {
		if (!req.authUser || !profiles.includes(req.authUser.perfil)) {
			return res.status(403).json({ erro: 'Seu perfil não tem permissão para esta operação.' });
		}
		return next();
	};
}

module.exports = {
	createRequireAuth,
	requireRole
};
