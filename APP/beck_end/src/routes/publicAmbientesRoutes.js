const express = require('express');
const supabase = require('../config/supabase');
const ambientesService = require('../services/ambientesService');

const router = express.Router();

router.get('/', async (req, res, next) => {
	if (!supabase) {
		return res.status(503).json({ erro: 'Serviço de ambientes indisponível.' });
	}

	try {
		const ambientes = await ambientesService.listPublicAmbientes();
		res.json(ambientes);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
