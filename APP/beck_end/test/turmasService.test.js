const test = require('node:test');
const assert = require('node:assert/strict');
const { createListTurmas } = require('../src/services/turmasService');

function createDatabase(data) {
	const queries = [];
	const database = {
		queries,
		from(table) {
			const query = { table, filters: [] };
			queries.push(query);
			const builder = {
				select(columns) {
					query.columns = columns;
					return builder;
				},
				order(column) {
					query.order = column;
					return builder;
				},
				eq(column, value) {
					query.filters.push([column, value]);
					return builder;
				},
				then(resolve, reject) {
					return Promise.resolve({ data, error: null }).then(resolve, reject);
				}
			};
			return builder;
		}
	};
	return database;
}

test('limits teacher class reports to classes linked to their teacher record', async () => {
	const database = createDatabase([{
		id: 5,
		codigo: 'T-5',
		nome: 'Turma 5',
		turno: 'Manhã',
		cursos: { id: 2, nome: 'Curso', tipos_curso: { id: 1, nome: 'Técnico' } },
		turma_componentes_docentes: [{ componentes_curriculares: { nome: 'Matemática' } }]
	}]);
	const listTurmas = createListTurmas(database);

	const result = await listTurmas({ docenteId: 42 });

	assert.match(database.queries[0].columns, /turma_componentes_docentes!inner/);
	assert.deepEqual(database.queries[0].filters, [['turma_componentes_docentes.docente_id', 42]]);
	assert.deepEqual(result[0].materias, ['Matemática']);
});

test('keeps the complete class report for coordinator queries', async () => {
	const database = createDatabase([]);
	const listTurmas = createListTurmas(database);

	await listTurmas();

	assert.doesNotMatch(database.queries[0].columns, /turma_componentes_docentes!inner/);
	assert.deepEqual(database.queries[0].filters, []);
});
