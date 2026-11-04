const express = require('express');
const router = express.Router();
const atribuicoesService = require('../services/atribuicoesService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria', 'docente'), async (req, res, next) => {
	try {
		const docenteId = req.authUser.perfil === 'docente' ? req.authUser.docenteId : undefined;
		const atribuicoes = await atribuicoesService.listAtribuicoes({ docenteId });
		res.json(atribuicoes);
	} catch (error) {
		next(error);
	}
});

router.post('/', requireRole('coordenador'), async (req, res) => {
	try {
		const novaAtribuicao = await atribuicoesService.createAtribuicao(req.body);
		res.status(201).json(novaAtribuicao);
	} catch (error) {
		res.status(400).json({ erro: error.message || 'Não foi possível registrar a atribuição.' });
	}
});

module.exports = router;
