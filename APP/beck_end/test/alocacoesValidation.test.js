const test = require('node:test');
const assert = require('node:assert/strict');
const { validateAlocacao } = require('../src/services/alocacoesValidation');

test('normalizes valid allocation identifiers and schedule', () => {
	assert.deepEqual(validateAlocacao({
		ambienteId: '12',
		aulaId: '34',
		diaSemana: 'Quarta-feira',
		periodo: 'Tarde',
		horario: '14:10 - 16:00'
	}), {
		ambienteId: 12,
		aulaId: 34,
		diaSemana: 'Quarta-feira',
		periodo: 'Tarde',
		horario: '14:10 - 16:00'
	});
});

test('rejects missing, fractional, and non-positive identifiers', () => {
	for (const ambienteId of ['', '1.5', '0', '-2', 'abc']) {
		assert.throws(() => validateAlocacao({
			ambienteId,
			aulaId: 1,
			diaSemana: 'Segunda-feira',
			periodo: 'Manhã',
			horario: '07:00 - 08:50'
		}), /identificador inteiro válido/);
	}
});

test('rejects invalid weekdays and periods', () => {
	const valid = {
		ambienteId: 1,
		aulaId: 1,
		diaSemana: 'Domingo',
		periodo: 'Manhã',
		horario: '07:00 - 08:50'
	};
	assert.throws(() => validateAlocacao(valid), /dia da semana válido/);
	assert.throws(() => validateAlocacao({ ...valid, diaSemana: 'Segunda-feira', periodo: 'Madrugada' }), /período válido/);
});

test('rejects a time slot that does not belong to the selected period', () => {
	assert.throws(() => validateAlocacao({
		ambienteId: 1,
		aulaId: 1,
		diaSemana: 'Segunda-feira',
		periodo: 'Manhã',
		horario: '14:10 - 16:00'
	}), /horário válido para o período/);
});

test('rejects a null request body with a clear validation error', () => {
	assert.throws(() => validateAlocacao(null), /Ambiente deve ser um identificador inteiro válido/);
});
