const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const supabaseAuth = require('../config/supabaseAuth');
const { createRequireAuth } = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const turmasRoutes = require('./turmasRoutes');
const docentesRoutes = require('./docentesRoutes');
const ambientesRoutes = require('./ambientesRoutes');
const publicAmbientesRoutes = require('./publicAmbientesRoutes');
const atribuicoesRoutes = require('./atribuicoesRoutes');
const alocacoesRoutes = require('./alocacoesRoutes');
const manutencaoRoutes = require('./manutencaoRoutes');
const publicManutencaoRoutes = require('./publicManutencaoRoutes');

// Healthcheck
router.get('/health', (req, res) => {
	res.status(supabase ? 200 : 503).json({
		ok: Boolean(supabase),
		storage: supabase ? 'supabase' : 'not-configured',
		authentication: supabaseAuth ? 'configured' : 'not-configured',
		erro: supabase ? undefined : 'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env do backend.'
	});
});

router.use('/auth', authRoutes);

// These routes are public to support the public maintenance suggestion form only.
router.use('/public/ambientes', publicAmbientesRoutes);
router.use('/sugestoes-manutencao', publicManutencaoRoutes);

router.use((req, res, next) => {
	if (!supabase || !supabaseAuth) {
		return res.status(503).json({
			erro: 'Banco de dados ou autenticação não configurados. Verifique SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e SUPABASE_ANON_KEY no .env.'
		});
	}
	next();
});

router.use(createRequireAuth(supabase));

router.use('/turmas', turmasRoutes);
router.use('/docentes', docentesRoutes);
router.use('/ambientes', ambientesRoutes);
router.use('/atribuicoes', atribuicoesRoutes);
router.use('/alocacoes-ambiente', alocacoesRoutes);
router.use('/sugestoes-manutencao', manutencaoRoutes);

module.exports = router;
