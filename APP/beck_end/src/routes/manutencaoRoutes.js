const express = require('express');
const router = express.Router();
const manutencaoService = require('../services/manutencaoService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria', 'manutencao'), async (req, res, next) => {
	try {
		const sugestoes = await manutencaoService.listSugestoes();
		res.json(sugestoes);
	} catch (error) {
		next(error);
	}
});

router.get('/:id/historico', requireRole('manutencao'), async (req, res, next) => {
	try {
		const historico = await manutencaoService.listHistorico(req.params.id);
		res.json(historico);
	} catch (error) {
		next(error);
	}
});

router.patch('/:id', requireRole('manutencao'), async (req, res, next) => {
	try {
		const atualizada = await manutencaoService.updateSugestaoStatus(req.params.id, req.body, {
			responsavelId: req.authUser.id
		});
		if (!atualizada) {
			return res.status(404).json({ erro: 'Sugestão não encontrada.' });
		}
		res.json(atualizada);
	} catch (error) {
		if (error.statusCode) return res.status(error.statusCode).json({ erro: error.message });
		return next(error);
	}
});

module.exports = router;
