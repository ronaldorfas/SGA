const test = require('node:test');
const assert = require('node:assert/strict');
const createAlocacoesService = require('../src/services/alocacoesServiceFactory');

function createDatabase({ status = 'Disponível', conflict = null, insertError = null, rows = [], docenteId } = {}) {
	const inserted = [];
	const queries = [];
	const database = {
		queries,
		from(table) {
			const query = { table, filters: {}, payload: null };
			queries.push(query);
			const builder = {
				select() { return this; },
				eq(field, value) {
					query.filters[field] = value;
					return this;
				},
				insert(payload) {
					query.payload = payload;
					inserted.push({ table, payload });
					return this;
				},
				order() {
					return Promise.resolve({ data: rows, error: null });
				},
				maybeSingle() {
					if (table === 'ambientes') return Promise.resolve({ data: { id: 8, status }, error: null });
					if (table === 'turma_componentes_docentes') {
						const belongsToTeacher = !query.filters.docente_id || query.filters.docente_id === docenteId;
						return Promise.resolve({ data: belongsToTeacher ? { id: 17 } : null, error: null });
					}
					if (table === 'alocacoes_ambiente') return Promise.resolve({ data: conflict, error: null });
					throw new Error(`Consulta inesperada em ${table}`);
				},
				single() {
					if (insertError) return Promise.resolve({ data: null, error: insertError });
					return Promise.resolve({ data: { id: 21, ...query.payload }, error: null });
				}
			};
			return builder;
		}
	};

	return { database, inserted };
}

const request = {
	ambienteId: '8',
	aulaId: '17',
	diaSemana: 'Quarta-feira',
	periodo: 'Tarde',
	horario: '14:10 - 16:00'
};

test('validates references and persists the full allocation schedule', async () => {
	const { database, inserted } = createDatabase();
	const service = createAlocacoesService(database);

	const result = await service.createAlocacao(request);

	assert.equal(result.id, 21);
	assert.deepEqual(inserted, [{
		table: 'alocacoes_ambiente',
		payload: {
			ambiente_id: 8,
			atribuicao_aula_id: 17,
			dia_semana: 'Quarta-feira',
			periodo: 'Tarde',
			horario: '14:10 - 16:00'
		}
	}]);
});

test('does not save an allocation when the environment is unavailable', async () => {
	const { database, inserted } = createDatabase({ status: 'Em manutenção' });
	const service = createAlocacoesService(database);

	await assert.rejects(service.createAlocacao(request), /não está disponível/);
	assert.deepEqual(inserted, []);
});

test('does not save an allocation when the schedule is already occupied', async () => {
	const { database, inserted } = createDatabase({ conflict: { id: 4 } });
	const service = createAlocacoesService(database);

	await assert.rejects(service.createAlocacao(request), /já está alocado/);
	assert.deepEqual(inserted, []);
});

test('maps unique-index conflicts to a clear message', async () => {
	const { database } = createDatabase({ insertError: { code: '23505' } });
	const service = createAlocacoesService(database);

	await assert.rejects(service.createAlocacao(request), /já está alocado/);
});

test('limits teacher allocations to their linked teacher record', async () => {
	const { database, inserted } = createDatabase({ docenteId: 99 });
	const service = createAlocacoesService(database);

	await assert.rejects(service.createAlocacao(request, { docenteId: 42 }), /Aula não encontrada/);
	const assignmentQuery = database.queries.find((query) => query.table === 'turma_componentes_docentes');
	assert.equal(assignmentQuery.filters.docente_id, 42);
	assert.deepEqual(inserted, []);
});

test('returns stored schedule fields when listing allocations', async () => {
	const { database } = createDatabase({
		rows: [{
			id: 21,
			ambiente_id: 8,
			atribuicao_aula_id: 17,
			dia_semana: 'Quarta-feira',
			periodo: 'Tarde',
			horario: '14:10 - 16:00',
			ambientes: { codigo: 'LAB-02', nome: 'Laboratório' },
			turma_componentes_docentes: {
				turmas: { codigo: 'ADS-1A', nome: 'ADS 1A', turno: 'Tarde' },
				componentes_curriculares: { nome: 'Programação' },
				docentes: { nome: 'Docente de teste' }
			}
		}]
	});
	const service = createAlocacoesService(database);

	assert.deepEqual(await service.listAlocacoes(), [{
		id: 21,
		ambienteId: 8,
		ambienteNome: 'LAB-02 · Laboratório',
		ambienteCodigo: 'LAB-02',
		aulaId: 17,
		aulaDescricao: 'ADS 1A · Programação · Docente de teste',
		diaSemana: 'Quarta-feira',
		horario: '14:10 - 16:00',
		periodo: 'Tarde'
	}]);
});
