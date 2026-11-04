const test = require('node:test');
const assert = require('node:assert/strict');
const calculateIndicators = require('../src/calcularIndicadores');

test('calculates the leading environment share and maintenance completion rate', () => {
	const result = calculateIndicators([
		{ ambienteId: 1, ambienteNome: 'Sala A' },
		{ ambienteId: 1, ambienteNome: 'Sala A' },
		{ ambienteId: 2, ambienteNome: 'Sala B' },
		{ ambienteId: 1, ambienteNome: 'Sala A' }
	], [
		{ status: 'Concluída' },
		{ status: 'Pendente' },
		{ status: 'Em análise' },
		{ status: 'concluida' }
	]);

	assert.deepEqual(result, {
		allocationConcentration: {
			totalAllocations: 4,
			environmentCount: 2,
			leadingEnvironment: { id: '1', name: 'Sala A', total: 3 },
			percentage: 75
		},
		maintenanceCompletion: {
			totalSuggestions: 4,
			completedSuggestions: 2,
			percentage: 50
		}
	});
});

test('returns null percentages when no records exist', () => {
	assert.deepEqual(calculateIndicators([], []), {
		allocationConcentration: {
			totalAllocations: 0,
			environmentCount: 0,
			leadingEnvironment: null,
			percentage: null
		},
		maintenanceCompletion: {
			totalSuggestions: 0,
			completedSuggestions: 0,
			percentage: null
		}
	});
});

test('handles tied environments deterministically and accent-insensitive statuses', () => {
	const result = calculateIndicators([
		{ ambienteId: 2, ambienteNome: 'Sala B' },
		{ ambienteId: 1, ambienteNome: 'Sala A' }
	], [{ status: ' CONCLUIDA ' }]);

	assert.equal(result.allocationConcentration.leadingEnvironment.name, 'Sala A');
	assert.equal(result.allocationConcentration.percentage, 50);
	assert.equal(result.maintenanceCompletion.percentage, 100);
});

test('rejects invalid data shapes instead of producing misleading indicators', () => {
	assert.throws(() => calculateIndicators(null, []), /devem ser listas/);
	assert.throws(() => calculateIndicators([], {}), /devem ser listas/);
});
