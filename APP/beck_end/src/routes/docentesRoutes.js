const express = require('express');
const router = express.Router();
const docentesService = require('../services/docentesService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria'), async (req, res, next) => {
	try {
		const docentes = await docentesService.listDocentes();
		res.json(docentes);
	} catch (error) {
		next(error);
	}
});

router.post('/', requireRole('coordenador', 'secretaria'), async (req, res) => {
	try {
		const novoDocente = await docentesService.createDocente(req.body);
		res.status(201).json(novoDocente);
	} catch (error) {
		res.status(400).json({ erro: error.message || 'Não foi possível cadastrar o docente.' });
	}
});

module.exports = router;
