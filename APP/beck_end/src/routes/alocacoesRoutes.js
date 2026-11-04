const express = require('express');
const router = express.Router();
const alocacoesService = require('../services/alocacoesService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria', 'manutencao'), async (req, res, next) => {
	try {
		const alocacoes = await alocacoesService.listAlocacoes();
		res.json(alocacoes);
	} catch (error) {
		next(error);
	}
});

router.post('/', requireRole('coordenador', 'docente'), async (req, res) => {
	try {
		const docenteId = req.authUser.perfil === 'docente' ? req.authUser.docenteId : undefined;
		const novaAlocacao = await alocacoesService.createAlocacao(req.body, { docenteId });
		res.status(201).json(novaAlocacao);
	} catch (error) {
		res.status(400).json({ erro: error.message || 'Não foi possível registrar a alocação.' });
	}
});

module.exports = router;
