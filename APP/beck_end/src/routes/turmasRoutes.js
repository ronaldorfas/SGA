const express = require('express');
const router = express.Router();
const turmasService = require('../services/turmasService');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('coordenador', 'secretaria', 'docente'), async (req, res, next) => {
	try {
		const docenteId = req.authUser.perfil === 'docente' ? req.authUser.docenteId : undefined;
		const turmas = await turmasService.listTurmas({ docenteId });
		res.json(turmas);
	} catch (error) {
		next(error);
	}
});

router.post('/', requireRole('coordenador', 'secretaria'), async (req, res) => {
	try {
		const novaTurma = await turmasService.createTurma(req.body);
		res.status(201).json(novaTurma);
	} catch (error) {
		res.status(400).json({ erro: error.message || 'Não foi possível criar a turma.' });
	}
});

module.exports = router;
