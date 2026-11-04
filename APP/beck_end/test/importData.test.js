const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateSql, parseRow } = require('../../Banco_de_dados/import-t.sql');

function row(overrides = {}) {
	const columns = [
		'Aprendizagem', 'Aprendizagem Industrial', "Curso d'Oeste", '400',
		'', '', 'T1-AA', 'Manhã', 'Ativa', '07:00:00', '11:00:00',
		'01/01/2026', '30/06/2026', '', '', '', 'ADM', 'Administração', '40'
	];
	const indexes = {
		nivel: 0,
		tipoCurso: 1,
		curso: 2,
		cargaCurso: 3,
		turma: 6,
		turno: 7,
		situacao: 8,
		horarioInicio: 9,
		horarioFim: 10,
		periodoInicio: 11,
		periodoFim: 12,
		docente: 14,
		sigla: 16,
		componente: 17,
		cargaComponente: 18
	};
	Object.entries(overrides).forEach(([key, value]) => { columns[indexes[key]] = value; });
	return columns.join('\t');
}

test('parses a valid academic data row and normalizes dates and times', () => {
	assert.deepEqual(parseRow(row({ horarioInicio: '07:00', horarioFim: '11:00' }), 2), {
		nivel: 'Aprendizagem',
		tipoCurso: 'Aprendizagem Industrial',
		curso: "Curso d'Oeste",
		cargaCurso: 400,
		turma: 'T1-AA',
		turno: 'Manhã',
		situacao: 'Ativa',
		horarioInicio: '07:00:00',
		horarioFim: '11:00:00',
		periodoInicio: '2026-01-01',
		periodoFim: '2026-06-30',
		docente: null,
		sigla: 'ADM',
		componente: 'Administração',
		cargaComponente: 40
	});
});

test('rejects invalid date, time range, and incomplete time pairs with source line', () => {
	assert.throws(() => parseRow(row({ periodoInicio: '31/02/2026' }), 8), /Linha 8: Período inicial não é uma data válida/);
	assert.throws(() => parseRow(row({ horarioInicio: '11:00:00', horarioFim: '07:00:00' }), 9), /Linha 9: horário final deve ser posterior/);
	assert.throws(() => parseRow(row({ horarioFim: '' }), 10), /Linha 10: horários inicial e final devem ser informados juntos/);
});

test('rejects incomplete rows and non-positive charges', () => {
	assert.throws(() => parseRow('only\tfew\tcolumns', 11), /Linha 11: esperadas pelo menos 19 colunas/);
	assert.throws(() => parseRow(row({ cargaComponente: '0' }), 12), /Linha 12: carga horária do componente deve ser um inteiro positivo/);
});

test('escapes string values in the generated SQL', () => {
	const parsed = parseRow(row());
	const sql = generateSql([parsed]);
	assert.match(sql, /Curso d''Oeste/);
	assert.match(sql, /^begin;/);
	assert.match(sql, /commit;\s*$/);
});

test('all versioned TSV records pass the ingestion rules', () => {
	const sourcePath = path.join(__dirname, '../../Banco_de_dados/t.sql');
	const lines = fs.readFileSync(sourcePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
	const records = lines.slice(1).filter((line) => line.trim());

	assert.ok(records.length > 0);
	records.forEach((line, index) => parseRow(line, index + 2));
});
