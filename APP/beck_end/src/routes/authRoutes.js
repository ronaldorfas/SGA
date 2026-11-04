const express = require('express');
const supabaseAuth = require('../config/supabaseAuth');
const { createAuthService } = require('../services/authServiceFactory');

const router = express.Router();
const authService = createAuthService(supabaseAuth);

function handleAuthError(error, res) {
	const statusCode = error.statusCode || 500;
	if (statusCode === 500) {
		console.error('❌ Erro no serviço de autenticação:', error.message || error);
		return res.status(500).json({ erro: 'Não foi possível concluir a autenticação.' });
	}
	return res.status(statusCode).json({ erro: error.message });
}

router.post('/login', async (req, res) => {
	try {
		const session = await authService.signIn(req.body);
		res.json(session);
	} catch (error) {
		handleAuthError(error, res);
	}
});

router.post('/refresh', async (req, res) => {
	try {
		const session = await authService.refresh(req.body);
		res.json(session);
	} catch (error) {
		handleAuthError(error, res);
	}
});

module.exports = router;
