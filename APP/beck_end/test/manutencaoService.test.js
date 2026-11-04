const test = require('node:test');
const assert = require('node:assert/strict');
const { createManutencaoService } = require('../src/services/manutencaoService');

function createDatabase({ suggestion = null, history = [] } = {}) {
	const queries = [];
	const database = {
		queries,
		from(table) {
			const query = { table, filters: [], payload: null };
			queries.push(query);
			const builder = {
				select(columns) {
					query.columns = columns;
					return builder;
				},
				eq(column, value) {
					query.filters.push([column, value]);
					return builder;
				},
				order(column) {
					query.order = column;
					return builder;
				},
				update(payload) {
					query.payload = payload;
					return builder;
				},
				maybeSingle() {
					if (table !== 'sugestoes_manutencao') return Promise.resolve({ data: null, error: null });
					if (!suggestion || query.filters.some(([column, value]) => {
						if (column === 'id') return Number(value) !== suggestion.id;
						return suggestion[column] !== value;
					})) return Promise.resolve({ data: null, error: null });
					if (query.payload) {
						Object.assign(suggestion, query.payload);
						return Promise.resolve({
							data: { ...suggestion, ambientes: { nome: 'Sala 1', local: 'Bloco A' }, ocorrencias_manutencao: [{ id: 76 }] },
							error: null
						});
					}
					return Promise.resolve({ data: suggestion, error: null });
				},
				then(resolve, reject) {
					const data = table === 'historico_manutencao' ? history : [];
					return Promise.resolve({ data, error: null }).then(resolve, reject);
				}
			};
			return builder;
		}
	};
	return database;
}

function pendingSuggestion(status = 'Em análise') {
	return {
		id: 12,
		status,
		ambiente_id: 3,
		nome: 'Solicitante',
		sujestao: 'Vazamento na sala',
		criadoem: '2026-11-03T10:00:00Z',
		comentario: null
	};
}

test('requires a valid transition and blocks bypassing triage', async () => {
	const database = createDatabase({ suggestion: pendingSuggestion() });
	const service = createManutencaoService(database);

	await assert.rejects(
		service.updateSugestaoStatus(12, { status: 'Finalizada', comentario: 'Concluído' }, { responsavelId: 'user-id' }),
		/Transição inválida/
	);
	assert.equal(database.queries.some((query) => query.payload), false);
});

test('requires analysis, category, priority, and action notes before approving', async () => {
	const database = createDatabase({ suggestion: pendingSuggestion() });
	const service = createManutencaoService(database);

	await assert.rejects(
		service.updateSugestaoStatus(12, { status: 'Aprovada', comentario: 'Confirmado' }, { responsavelId: 'user-id' }),
		/tipo de ocorrência válido/
	);
	assert.equal(database.queries.some((query) => query.payload), false);
});

test('requires a decision explanation before rejecting a suggestion', async () => {
	const database = createDatabase({ suggestion: pendingSuggestion() });
	const service = createManutencaoService(database);

	await assert.rejects(
		service.updateSugestaoStatus(12, {
			status: 'Não aprovada',
			comentario: 'Revisado.'
		}, { responsavelId: 'user-id' }),
		/resultado da análise/
	);
	assert.equal(database.queries.some((query) => query.payload), false);
});

test('approves a validated request and returns its generated occurrence', async () => {
	const database = createDatabase({ suggestion: pendingSuggestion() });
	const service = createManutencaoService(database);

	const result = await service.updateSugestaoStatus(12, {
		status: 'Aprovada',
		comentario: 'Vistoria concluída.',
		resultadoAnalise: 'Problema confirmado.',
		tipoOcorrencia: 'Vazamento',
		prioridade: 'Alta'
	}, { responsavelId: 'maintenance-user' });

	const write = database.queries.find((query) => query.payload);
	assert.equal(write.payload.responsavel_id, 'maintenance-user');
	assert.deepEqual(write.filters, [['id', 12], ['status', 'Em análise']]);
	assert.equal(result.status, 'Aprovada');
	assert.equal(result.ocorrenciaId, 76);
	assert.equal(result.tipoOcorrencia, 'Vazamento');
});

test('records actor, action, observation, and timestamp in history responses', async () => {
	const database = createDatabase({
		history: [{
			id: 1,
			status_anterior: 'Pendente de análise',
			status_novo: 'Em análise',
			responsavel_id: 'maintenance-user',
			observacao: 'Iniciada a análise.',
			acao: 'Status alterado',
			criadoem: '2026-11-03T12:00:00Z'
		}]
	});
	const service = createManutencaoService(database);

	const history = await service.listHistorico(12);

	assert.equal(history[0].responsavelId, 'maintenance-user');
	assert.equal(history[0].status, 'Em análise');
	assert.equal(history[0].observacao, 'Iniciada a análise.');
	assert.equal(history[0].criadoEm, '2026-11-03T12:00:00Z');
});
