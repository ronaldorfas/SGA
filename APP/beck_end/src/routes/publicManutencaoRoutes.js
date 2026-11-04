const express = require('express');
const supabase = require('../config/supabase');
const manutencaoService = require('../services/manutencaoService');

const router = express.Router();

router.post('/', async (req, res, next) => {
	if (!supabase) {
		return res.status(503).json({ erro: 'Serviço de manutenção indisponível.' });
	}

	try {
		const novaSugestao = await manutencaoService.createSugestao(req.body);
		res.status(201).json(novaSugestao);
	} catch (error) {
		if (error.statusCode) return res.status(error.statusCode).json({ erro: error.message });
		return next(error);
	}
});

module.exports = router;
