const express = require('express');
const router = express.Router();
const ambientesService = require('../services/ambientesService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria', 'docente', 'manutencao'), async (req, res, next) => {
	try {
		const ambientes = await ambientesService.listAmbientes();
		res.json(ambientes);
	} catch (error) {
		next(error);
	}
});

module.exports = router;
