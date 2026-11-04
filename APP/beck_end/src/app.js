const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

// Middlewares globais
app.use(cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(null, false);
	}
}));
app.use(express.json({ limit: '50kb' }));

// Montagem das rotas da API sob o prefixo /api
app.use('/api', apiRoutes);

// Rota 404 para rotas não encontradas
app.use((req, res) => {
	res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Middleware de tratamento global de erros
app.use((err, req, res, next) => {
	console.error('❌ Erro não tratado no servidor:', err.message || err);
	const statusCode = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode < 500
		? err.statusCode
		: 500;
	res.status(statusCode).json({
		erro: statusCode === 500 ? 'Erro interno do servidor.' : err.message
	});
});

module.exports = app;
